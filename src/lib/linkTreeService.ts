import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';

export interface Link {
  label: string;
  url: string;
}

export interface LinkTreeProfile {
  id: string;
  owner: string;
  name: string;
  avatar_cid: string;
  bio: string;
  links: Link[];
  theme: string;
  created_at: string;
  updated_at: string;
}

// Update these after deploying the contract
export const LINKTREE_PACKAGE_ID = '0xcadb70db3b02bade4b76c456e0d86cb114bd18400eaed802a1f0916429410a4c';
export const REGISTRY_ID = '0x2c6f1a4d3877e43a31f9087649a3185b4bd23b309e6635a9726ff2712ca0db65';

export class LinkTreeService {
  constructor(private client: SuiClient) {}

  /**
   * Create a new LinkTree profile
   */
  async createProfile(
    name: string,
    avatarCid: string,
    bio: string,
    theme: string = 'dark'
  ): Promise<Transaction> {
    const tx = new Transaction();

    tx.moveCall({
      target: `${LINKTREE_PACKAGE_ID}::linktree::create_profile`,
      arguments: [
        tx.object(REGISTRY_ID),
        tx.pure.string(name),
        tx.pure.string(avatarCid),
        tx.pure.string(bio),
        tx.pure.string(theme),
      ],
    });

    return tx;
  }

  /**
   * Update profile information
   */
  async updateProfile(
    profileId: string,
    avatarCid: string,
    bio: string,
    theme: string
  ): Promise<Transaction> {
    const tx = new Transaction();

    tx.moveCall({
      target: `${LINKTREE_PACKAGE_ID}::linktree::update_profile`,
      arguments: [
        tx.object(profileId),
        tx.pure.string(avatarCid),
        tx.pure.string(bio),
        tx.pure.string(theme),
      ],
    });

    return tx;
  }

  /**
   * Add a new link to profile
   */
  async addLink(
    profileId: string,
    label: string,
    url: string
  ): Promise<Transaction> {
    const tx = new Transaction();

    tx.moveCall({
      target: `${LINKTREE_PACKAGE_ID}::linktree::add_link`,
      arguments: [
        tx.object(profileId),
        tx.pure.string(label),
        tx.pure.string(url),
      ],
    });

    return tx;
  }

  /**
   * Update an existing link
   */
  async updateLink(
    profileId: string,
    index: number,
    label: string,
    url: string
  ): Promise<Transaction> {
    const tx = new Transaction();

    tx.moveCall({
      target: `${LINKTREE_PACKAGE_ID}::linktree::update_link`,
      arguments: [
        tx.object(profileId),
        tx.pure.u64(index),
        tx.pure.string(label),
        tx.pure.string(url),
      ],
    });

    return tx;
  }

  /**
   * Remove a link from profile
   */
  async removeLink(
    profileId: string,
    index: number
  ): Promise<Transaction> {
    const tx = new Transaction();

    tx.moveCall({
      target: `${LINKTREE_PACKAGE_ID}::linktree::remove_link`,
      arguments: [
        tx.object(profileId),
        tx.pure.u64(index),
      ],
    });

    return tx;
  }

  /**
   * Get profile by object ID
   */
  async getProfile(profileId: string): Promise<LinkTreeProfile | null> {
    try {
      const object = await this.client.getObject({
        id: profileId,
        options: {
          showContent: true,
          showOwner: true,
        },
      });

      if (!object.data || !object.data.content || object.data.content.dataType !== 'moveObject') {
        return null;
      }

      const fields = object.data.content.fields as any;

      return {
        id: profileId,
        owner: fields.owner,
        name: fields.name,
        avatar_cid: fields.avatar_cid,
        bio: fields.bio,
        links: fields.links || [],
        theme: fields.theme,
        created_at: fields.created_at,
        updated_at: fields.updated_at,
      };
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }

  /**
   * Get profile ID by name from registry
   */
  async getProfileIdByName(name: string): Promise<string | null> {
    try {
      const registry = await this.client.getObject({
        id: REGISTRY_ID,
        options: {
          showContent: true,
        },
      });

      if (!registry.data || !registry.data.content || registry.data.content.dataType !== 'moveObject') {
        return null;
      }

      const fields = registry.data.content.fields as any;
      const nameToId = fields.name_to_id;
      
      // Query dynamic field
      const dynamicField = await this.client.getDynamicFieldObject({
        parentId: nameToId.fields.id.id,
        name: {
          type: '0x1::string::String',
          value: name,
        },
      });

      if (!dynamicField.data || !dynamicField.data.content || dynamicField.data.content.dataType !== 'moveObject') {
        return null;
      }

      const value = (dynamicField.data.content.fields as any).value;
      return value;
    } catch (error) {
      console.error('Error getting profile ID by name:', error);
      return null;
    }
  }

  /**
   * Get all profiles owned by an address
   */
  async getProfilesByOwner(ownerAddress: string): Promise<LinkTreeProfile[]> {
    try {
      const objects = await this.client.getOwnedObjects({
        owner: ownerAddress,
        filter: {
          StructType: `${LINKTREE_PACKAGE_ID}::linktree::LinkTreeProfile`,
        },
        options: {
          showContent: true,
        },
      });

      const profiles: LinkTreeProfile[] = [];

      for (const obj of objects.data) {
        if (!obj.data || !obj.data.content || obj.data.content.dataType !== 'moveObject') {
          continue;
        }

        const fields = obj.data.content.fields as any;
        profiles.push({
          id: obj.data.objectId,
          owner: fields.owner,
          name: fields.name,
          avatar_cid: fields.avatar_cid,
          bio: fields.bio,
          links: fields.links || [],
          theme: fields.theme,
          created_at: fields.created_at,
          updated_at: fields.updated_at,
        });
      }

      return profiles;
    } catch (error) {
      console.error('Error fetching profiles by owner:', error);
      return [];
    }
  }
}
