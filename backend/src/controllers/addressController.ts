import { Request, Response } from 'express';
import { Address, IAddress } from '../models/Address';

// Get all addresses for a user
export const getAddresses = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const addresses = await Address.find({ user: userId });
    res.status(200).json(addresses);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ message: 'Error fetching addresses' });
  }
};

// Get a single address by ID
export const getAddressById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const address = await Address.findOne({ _id: id, user: userId });
    
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    res.status(200).json(address);
  } catch (error) {
    console.error('Error fetching address:', error);
    res.status(500).json({ message: 'Error fetching address' });
  }
};

// Create a new address
export const createAddress = async (req: Request, res: Response) => {
  try {
    console.log('Creating address with body:', req.body);
    const userId = req.user?.userId;
    
    if (!userId) {
      console.log('No user ID found in request');
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { title, address, latitude, longitude, isDefault: isDefaultParam } = req.body;
    let isDefault = isDefaultParam;

    console.log('Processing address creation:', {
      userId,
      title,
      address,
      latitude,
      longitude,
      isDefault
    });

    // If this is the first address or isDefault is true, handle default status
    if (isDefault) {
      // Set all other addresses to non-default
      await Address.updateMany({ user: userId }, { isDefault: false });
    } else {
      // Check if this is the first address
      const addressCount = await Address.countDocuments({ user: userId });
      if (addressCount === 0) {
        // If it's the first address, make it default
        isDefault = true;
      }
    }

    const newAddress = new Address({
      user: userId,
      title,
      address,
      latitude,
      longitude,
      isDefault
    });

    await newAddress.save();
    console.log('Address created successfully:', newAddress);
    res.status(201).json(newAddress);
  } catch (error) {
    console.error('Error creating address:', error);
    res.status(500).json({ message: 'Error creating address', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// Update an address
export const updateAddress = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { title, address, latitude, longitude, isDefault } = req.body;

    // If setting as default, update other addresses
    if (isDefault) {
      await Address.updateMany({ user: userId, _id: { $ne: id } }, { isDefault: false });
    }

    const updatedAddress = await Address.findOneAndUpdate(
      { _id: id, user: userId },
      { title, address, latitude, longitude, isDefault },
      { new: true }
    );

    if (!updatedAddress) {
      return res.status(404).json({ message: 'Address not found' });
    }

    res.status(200).json(updatedAddress);
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ message: 'Error updating address' });
  }
};

// Delete an address
export const deleteAddress = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // First check if the address exists and is default
    const addressToDelete = await Address.findOne({ _id: id, user: userId });
    if (!addressToDelete) {
      return res.status(404).json({ message: 'Address not found' });
    }

    const wasDefault = addressToDelete.isDefault;

    // Delete the address
    await Address.deleteOne({ _id: id, user: userId });

    // If the deleted address was default, make another address default if available
    if (wasDefault) {
      const anotherAddress = await Address.findOne({ user: userId });
      if (anotherAddress) {
        await Address.findByIdAndUpdate(anotherAddress._id, { isDefault: true });
      }
    }

    res.status(200).json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({ message: 'Error deleting address' });
  }
}; 