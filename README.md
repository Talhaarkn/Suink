# 🔗 SuiNK - On-Chain Decentralized LinkTree

A fully decentralized LinkTree alternative built on the **Sui blockchain** with **Walrus storage**. Create your personalized link collection page, stored entirely on-chain, accessible via SuiNS domains.

## 🌟 Features

- ✅ **On-Chain Storage**: All profile data stored on Sui blockchain
- ✅ **Walrus Integration**: Avatar images stored on decentralized Walrus storage
- ✅ **Flatland-style NFT Routing**: Each profile is an NFT with unique URL (`/0x{hexaddr}`)
- ✅ **Enoki Sponsored Transactions**: Create profiles without paying gas fees
- ✅ **zkLogin**: Login with Google using Sui's zkLogin technology
- ✅ **Dynamic Fields**: Profile name to object ID mapping using Sui's dynamic fields
- ✅ **Customizable Themes**: Multiple theme options (Ocean, Sunset, Forest, Purple, Dark)
- ✅ **Unlimited Links**: Add as many links as you want to your profile
- ✅ **Wallet Support**: Compatible with all Sui wallets (Sui Wallet, Suiet, etc.)

## 🏗️ Architecture

### Smart Contract (Move)
- **Module**: `sui_linktree::linktree`
- **Main Objects**:
  - `LinkTreeProfile`: Stores user profile data (name, bio, avatar, links, theme)
  - `ProfileRegistry`: Global registry for name-to-profile-ID mapping
  - `ProfileCap`: Capability object for profile ownership

### Frontend (React + TypeScript)
- **Framework**: React with Vite
- **UI Library**: Tailwind CSS
- **Sui Integration**: @mysten/dapp-kit, @mysten/sui
- **Routing**: React Router
- **State Management**: React hooks

### Backend Services
- **Walrus Proxy**: Node.js proxy for Walrus CLI uploads (port 3003)
- **Enoki Backend**: Sponsored transaction server (port 3004)

### Storage
- **On-Chain**: Sui blockchain (profile data, links)
- **Off-Chain**: Walrus (images, avatars)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **Sui CLI** ([Installation Guide](https://docs.sui.io/guides/developer/getting-started/sui-install))
- **Walrus CLI** ([Installation Guide](https://docs.wal.app/usage/started.html))
- **Walrus Site Builder** ([Installation Guide](https://docs.wal.app/walrus-sites/tutorial-install.html))

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/sui-linktree.git
cd sui-linktree
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Create a `.env` file in the root directory:

```env
VITE_LINKTREE_PACKAGE_ID=0x...  # Will be set after deployment
VITE_REGISTRY_ID=0x...          # Will be set after deployment
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### 4. Build and Deploy Smart Contract

```bash
# Build the Move contract
sui move build

# Publish to Sui testnet
sui client publish --gas-budget 100000000

# Note the Package ID and Registry Object ID from the output
# Update your .env file with these values
```

### 5. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 📦 Deployment

### Deploy to Walrus Sites

1. **Build the React app**:
```bash
npm run build
```

2. **Deploy to Walrus**:
```bash
npm run deploy:walrus
# or manually:
site-builder deploy ./dist --epochs 1
```

3. **Note the B36 URL** from the output:
```
Site deployed successfully!
B36 URL: https://<b36-id>.trwal.app/
```

4. **Configure SuiNS** (optional):
   - Visit [testnet.suins.io](https://testnet.suins.io/)
   - Register your `.sui` name
   - Point it to your Walrus site object ID
   - Access via: `https://<yourname>.trwal.app/`

### Walrus Sites Configuration

The project uses TRWal portal configuration in `~/walrus/sites-config.yaml`:

```yaml
contexts:
  testnet:
    portal: trwal.app
    package: 0xf99aee9f21493e1590e7e5a9aea6f343a1f381031a04a732724871fc294be799
    staking_object: 0xbe46180321c30aab2f8b3501e24048377287fa708018a5b7c2792b35fe339ee3
    general:
       wallet_env: testnet
       walrus_context: testnet
       walrus_package: 0xd84704c17fc870b8764832c535aa6b11f21a95cd6f5bb38a9b07d2cf42220c66

default_context: testnet
site-builder publish ./dist --epochs 1

## 📚 Usage

### Creating a Profile

1. **Connect Wallet**: Use Sui Wallet or zkLogin with Google
2. **Fill Profile Details**:
   - Unique profile name
   - Bio description
   - Upload avatar image (stored on Walrus)
   - Select theme
3. **Create Profile**: Transaction will be sent to Sui blockchain
4. **Add Links**: Navigate to "My Profiles" and add your links

### Viewing a Profile

The project uses a Walrus Sites configuration. We ship a template in `.walrus/sites-config.yaml` and you can also place it at `~/.config/walrus/sites-config.yaml` (default lookup). Our config uses the TRWal portal for testnet:

1. **By Object ID**: `https://yoursite.trwal.app/view/<object-id>`
2. **By Name**: `https://yoursite.trwal.app/view/name/<profile-name>`
3. **Via SuiNS**: `https://<suins-name>.trwal.app/`

## 🛠️ Tech Stack

- **Blockchain**: Sui
- **Smart Contract Language**: Move
- **Storage**: Walrus
- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Sui SDK**: @mysten/dapp-kit, @mysten/sui

Note: The site-builder CLI looks for `sites-config.yaml` in the current directory, `~/.config/walrus/`, or `~/walrus/`. We pass `--config .walrus/sites-config.yaml` in scripts to use the local file.
- **Authentication**: zkLogin (Google OAuth)
- **Domain**: SuiNS

## 📖 Smart Contract Functions

### Entry Functions

- `create_profile`: Create a new LinkTree profile
- `update_profile`: Update profile information (bio, avatar, theme)
- `add_link`: Add a new link to your profile
- `update_link`: Update an existing link
- `remove_link`: Remove a link from your profile

### View Functions

- `get_profile_id_by_name`: Get profile object ID by name
- `name_exists`: Check if a profile name is already taken

## 🔐 Security

- Profile ownership enforced via capability objects
- Only profile owner can modify their profile
- Unique profile names enforced by global registry
- All transactions require wallet signature

## 🌐 Links

- **Live Demo**: [Coming Soon]
- **Sui Explorer**: [suiscan.xyz/testnet](https://suiscan.xyz/testnet)
- **Walrus Explorer**: [walruscan.com/testnet](https://walruscan.com/testnet)
- **Documentation**: [See DEPLOYMENT.md](./DEPLOYMENT.md)

## 📹 Demo Video

[Link to 3-5 minute demo video]

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for [Hackathon Name]
- Powered by [Sui](https://sui.io/) and [Walrus](https://walrus.xyz/)
- Inspired by [Flatland](https://github.com/MystenLabs/example-walrus-sites/tree/main/flatland)

## 📞 Contact

- **Team**: [Your Team Name]
- **Email**: [your@email.com]
- **Twitter**: [@yourhandle]

---

Made with ❤️ on Sui blockchain
