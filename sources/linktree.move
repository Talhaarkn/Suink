/// On-Chain LinkTree Module
module sui_linktree::linktree;

use std::string::String;
use sui::event;
use sui::package;
use sui::display;
use sui::hex;

// Walrus site address for visualization - YOUR DEPLOYED SITE OBJECT ID
const VISUALIZATION_SITE: address = @0xa94cea8c1f7cae892373d9ff9b603d3837637da775d4b8fe1226bf67efbd023b;

public struct Link has store, copy, drop {
    label: String,
    url: String,
}

public struct LinkTreeProfile has key, store {
    id: UID,
    owner: address,
    name: String,
    avatar_cid: String,
    bio: String,
    links: vector<Link>,
    theme: String,
    created_at: u64,
    updated_at: u64,
    hexaddr: String,
}

public struct ProfileRegistry has key {
    id: UID,
    profiles: vector<address>,
}

public struct ProfileCap has key, store {
    id: UID,
    profile_id: address,
}

public struct LINKTREE has drop {}

public struct ProfileCreated has copy, drop {
    profile_id: address,
    owner: address,
    name: String,
}

public struct ProfileUpdated has copy, drop {
    profile_id: address,
    owner: address,
}

public struct LinkAdded has copy, drop {
    profile_id: address,
    label: String,
    url: String,
}

fun init(otw: LINKTREE, ctx: &mut TxContext) {
    let registry = ProfileRegistry {
        id: object::new(ctx),
        profiles: vector::empty(),
    };
    transfer::share_object(registry);

    // Create publisher and display for LinkTreeProfile
    let publisher = package::claim(otw, ctx);
    let mut display = display::new<LinkTreeProfile>(&publisher, ctx);

    // Set display fields - Flatland style
    display.add(b"name".to_string(), b"{name}".to_string());
    display.add(b"description".to_string(), b"{bio}".to_string());
    display.add(b"image_url".to_string(), b"https://aggregator.walrus-testnet.walrus.space/v1/{avatar_cid}".to_string());
    display.add(b"link".to_string(), b"https://suinks.trwal.app/0x{hexaddr}".to_string());
    display.add(b"walrus site address".to_string(), VISUALIZATION_SITE.to_string());
    display.update_version();

    transfer::public_transfer(publisher, ctx.sender());
    transfer::public_transfer(display, ctx.sender());
}

entry fun create_profile(
    registry: &mut ProfileRegistry,
    name: String,
    avatar_cid: String,
    bio: String,
    theme: String,
    ctx: &mut TxContext
) {
    let sender = ctx.sender();
    let timestamp = ctx.epoch();
    
    let id = object::new(ctx);
    let hexaddr = hex::encode(id.to_bytes()).to_string();
    
    let profile = LinkTreeProfile {
        id,
        owner: sender,
        name,
        avatar_cid,
        bio,
        links: vector::empty(),
        theme,
        created_at: timestamp,
        updated_at: timestamp,
        hexaddr,
    };

    let profile_addr = object::uid_to_address(&profile.id);
    registry.profiles.push_back(profile_addr);

    let cap = ProfileCap {
        id: object::new(ctx),
        profile_id: profile_addr,
    };

    event::emit(ProfileCreated {
        profile_id: profile_addr,
        owner: sender,
        name: profile.name,
    });

    transfer::transfer(cap, sender);
    transfer::share_object(profile);
}

entry fun update_profile(
    profile: &mut LinkTreeProfile,
    avatar_cid: String,
    bio: String,
    theme: String,
    ctx: &mut TxContext
) {
    let sender = ctx.sender();
    assert!(profile.owner == sender, 4);

    profile.avatar_cid = avatar_cid;
    profile.bio = bio;
    profile.theme = theme;
    profile.updated_at = ctx.epoch();

    event::emit(ProfileUpdated {
        profile_id: object::uid_to_address(&profile.id),
        owner: sender,
    });
}

entry fun add_link(
    profile: &mut LinkTreeProfile,
    label: String,
    url: String,
    ctx: &mut TxContext
) {
    let sender = ctx.sender();
    assert!(profile.owner == sender, 4);
    assert!(profile.links.length() < 20, 1);

    let link = Link { label, url };
    profile.links.push_back(link);
    profile.updated_at = ctx.epoch();

    event::emit(LinkAdded {
        profile_id: object::uid_to_address(&profile.id),
        label,
        url,
    });
}

entry fun update_link(
    profile: &mut LinkTreeProfile,
    index: u64,
    label: String,
    url: String,
    ctx: &mut TxContext
) {
    let sender = ctx.sender();
    assert!(profile.owner == sender, 4);
    assert!(index < profile.links.length(), 0);

    let link = Link { label, url };
    let old_link = &mut profile.links[index];
    *old_link = link;
    profile.updated_at = ctx.epoch();

    event::emit(ProfileUpdated {
        profile_id: object::uid_to_address(&profile.id),
        owner: sender,
    });
}

entry fun remove_link(
    profile: &mut LinkTreeProfile,
    index: u64,
    ctx: &mut TxContext
) {
    let sender = ctx.sender();
    assert!(profile.owner == sender, 4);
    assert!(index < profile.links.length(), 0);

    profile.links.remove(index);
    profile.updated_at = ctx.epoch();

    event::emit(ProfileUpdated {
        profile_id: object::uid_to_address(&profile.id),
        owner: sender,
    });
}

#[test_only]
public fun init_for_testing(ctx: &mut TxContext) {
    let otw = LINKTREE {};
    init(otw, ctx);
}
