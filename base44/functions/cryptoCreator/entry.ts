import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

// ═══════════════════════════════════════════════════════════════════════════
// cryptoCreator — No-code crypto token creator.
// Generates ERC-20 Solidity contract code from user parameters and stores it.
// Deployment requires a wallet + RPC provider (user provides or uses external).
//
// Actions:
//   create_token    — generate Solidity contract from parameters
//   list_tokens     — get user's created tokens
//   get_token       — get a single token with contract code
//   deploy_token    — mark token as deployed (user deploys externally)
// ═══════════════════════════════════════════════════════════════════════════

function generateERC20(name: string, symbol: string, supply: string, decimals: number, features: string[]): string {
  const mintable = features.includes('mintable');
  const burnable = features.includes('burnable');
  const pausable = features.includes('pausable');

  return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";${burnable ? '\nimport \"@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol\";"' : ''}${pausable ? '\nimport "@openzeppelin/contracts/security/Pausable.sol";' : ''}${mintable ? '\nimport "@openzeppelin/contracts/access/Ownable.sol";' : ''}

contract ${symbol} is ERC20${burnable ? ', ERC20Burnable' : ''}${pausable ? ', Pausable' : ''}${mintable ? ', Ownable' : ''} {
    uint256 private constant INITIAL_SUPPLY = ${supply} * 10 ** ${decimals};

    constructor() ERC20("${name}", "${symbol}") {
        _mint(msg.sender, INITIAL_SUPPLY);
    }
${mintable ? `
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }` : ''}${pausable ? `
    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override {
        require(!paused(), "Token transfer while paused");
        super._beforeTokenTransfer(from, to, amount);
    }` : ''}
}`;
}

const NETWORK_RPCS: Record<string, string> = {
  ethereum: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
  polygon: 'https://polygon-rpc.com',
  base: 'https://mainnet.base.org',
  arbitrum: 'https://arb1.arbitrum.io/rpc',
  solana: 'https://api.mainnet-beta.solana.com',
};

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const svc = base44.asServiceRole;
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'list_tokens';

    switch (action) {
      case 'create_token': {
        if (!body.token_name || !body.symbol)
          return Response.json({ error: 'token_name and symbol required' }, { status: 400 });

        const decimals = body.decimals || 18;
        const supply = body.supply || '1000000000';
        const features = body.features || [];
        const blockchain = body.blockchain || 'ethereum';

        const contractCode = generateERC20(body.token_name, body.symbol, supply, decimals, features);

        // Generate simple ABI
        const abi = JSON.stringify([
          { inputs: [], stateMutability: 'nonpayable', type: 'constructor' },
          { inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], name: 'transfer', outputs: [{ name: '', type: 'bool' }], stateMutability: 'nonpayable', type: 'function' },
          { inputs: [{ name: 'owner', type: 'address' }], name: 'balanceOf', outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
          { inputs: [], name: 'totalSupply', outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
        ]);

        const token = await svc.entities.CryptoToken.create({
          owner_id: user.id,
          token_name: body.token_name,
          symbol: body.symbol.toUpperCase(),
          supply,
          decimals,
          blockchain,
          contract_code: contractCode,
          abi,
          deployment_status: 'code_generated',
          features,
          network_rpc: NETWORK_RPCS[blockchain] || '',
          created_at: new Date().toISOString(),
        });

        return Response.json({
          ok: true,
          token,
          deployment_instructions: {
            steps: [
              'Install Foundry or Hardhat: `npm install -g hardhat`',
              'Create a new project and save the contract code to contracts/' + body.symbol + '.sol',
              'Install OpenZeppelin: `npm install @openzeppelin/contracts`',
              'Deploy: `npx hardhat run scripts/deploy.js --network ' + blockchain + '`',
              'Update the contract address here after deployment',
            ],
            rpc_url: NETWORK_RPCS[blockchain],
          },
        });
      }

      case 'list_tokens': {
        const tokens = await svc.entities.CryptoToken.filter(
          { owner_id: user.id },
          '-created_date',
          50
        );
        return Response.json({ ok: true, tokens });
      }

      case 'get_token': {
        if (!body.token_id) return Response.json({ error: 'token_id required' }, { status: 400 });
        const token = await svc.entities.CryptoToken.get(body.token_id);
        return Response.json({ ok: true, token });
      }

      case 'deploy_token': {
        if (!body.token_id || !body.contract_address)
          return Response.json({ error: 'token_id and contract_address required' }, { status: 400 });
        await svc.entities.CryptoToken.update(body.token_id, {
          contract_address: body.contract_address,
          deployment_status: 'deployed',
          deployed_at: new Date().toISOString(),
          deployment_tx_hash: body.tx_hash || '',
          deployer_wallet: body.deployer_wallet || '',
        });
        return Response.json({ ok: true });
      }

      default:
        return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error) {
    console.error('[cryptoCreator] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}