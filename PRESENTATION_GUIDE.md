# 🎤 SuiNK - Presentation Guide

## 📌 What is SuiNK?

**SuiNK** = Decentralized Linktree on Sui blockchain
- All profile data on-chain (permanent, censorship-resistant)
- Images on Walrus (decentralized storage)
- Sign in with Google (zkLogin)
- You own your data

---

## ⚡ Key Features

1. **On-Chain Storage** - Profile data on Sui blockchain
2. **Walrus Integration** - Images on decentralized storage  
3. **NFT Profiles** - Each profile = unique NFT object
4. **zkLogin** - Sign in with Google (Web2 UX + Web3 security)
5. **Sponsored Transactions** - Create profiles without gas fees
6. **Custom Themes** - 5+ themes available
7. **SuiNS Domains** - Human-readable URLs (john.sui)

---

## 🏗️ Architecture

```
Frontend (React + Vite)
    ↓
Sui Blockchain (Move) + Walrus Storage (Images)
```

**Tech Stack:**
- Smart Contract: Move
- Frontend: React 18, TypeScript, Tailwind
- Storage: Sui (data) + Walrus (images)
- Auth: zkLogin (Google OAuth)

---

## 🎨 Smart Contract

**Main Functions:**
- `create_profile` - Create new profile
- `add_link` - Add link (max 20)
- `update_profile` - Update bio/avatar/theme
- `remove_link` - Delete link

**Security:**
- Capability-based ownership (ProfileCap)
- Only owner can edit
- All operations emit events

---

## 📊 Metrics

**Performance:**
- Transaction: ~0.5 sec
- Page load: ~1 sec

**Cost:**
- Profile creation: ~$0.05
- Add link: ~$0.01
- Storage: ~$0.15/5 epochs

---

## 🎬 Demo Flow (3 minutes)

**Step 1:** Connect wallet or sign in with Google  
**Step 2:** Create profile (name, bio, avatar, theme)  
**Step 3:** Add links (GitHub, Instagram, etc.)  
**Step 4:** View public profile  
**Step 5:** Verify on Sui Explorer (show on-chain data)

---

## 🏆 Hackathon Checklist

✅ Sui Blockchain (Move contract)  
✅ Walrus Storage (images)  
✅ Walrus Sites (frontend)  
✅ SuiNS Integration  
✅ Dynamic Fields  
✅ Flatland Pattern  
✅ zkLogin (Google OAuth)  
✅ Sponsored Transactions (ready)

**Score: 13/13** ✨

---

## 🎯 Presentation Script

**Opening (1 min):**
"SuiNK = Decentralized Linktree. Your data on blockchain, no one can delete it. Sign in with Google, no crypto knowledge needed."

**Demo (2 min):**
Show: Create profile → Add links → View profile → Verify on blockchain

**Highlights:**
- ⚡ Fast (~0.5 sec transactions)
- 💰 Cheap (~$0.05 per profile)
- 🛡️ Secure (capability-based)
- 🎨 Easy (Web2 UX)

**Closing:**
"Users own their data. Censorship-resistant. Decentralized alternative to $70B Linktree market."

---

## 💡 Key Innovations

1. **Dynamic Fields** - Name → Profile ID mapping
2. **Capability Security** - ProfileCap ownership
3. **Hybrid Storage** - On-chain + Walrus
4. **zkLogin** - Web2 UX + Web3 security

---

## ❓ Q&A Prep

**Q: Different from Linktree?**  
A: Blockchain storage = permanent, censorship-resistant

**Q: Gas fees expensive?**  
A: $0.05 profile, $0.01 link. Sponsored TX available.

**Q: Scalability?**  
A: Sui object model = millions of profiles, parallel processing

**Q: Why Walrus?**  
A: Faster than IPFS, integrated with Sui

---

## 📚 Links

**GitHub:** https://github.com/Talhaarkn/Suink.git  
**Sui Explorer:** https://suiscan.xyz/testnet  
**Walrus:** https://walruscan.com/testnet

---

*Good luck! 🚀*

