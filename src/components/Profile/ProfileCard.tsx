'use client';

import React, { useState, useRef } from 'react';
import { ProfileMetadata } from '@/lib/storage/types';
import { formatAddress, connectWallet, isWalletAvailable } from '@/lib/wallet/walletUtils';
import { updateProfileName, updateProfilePicture, linkWalletToProfile, unlinkWalletFromProfile, getProfileByWalletAddress, getCurrentProfileId } from '@/lib/storage/gameStorage';
import { CameraIcon, XIcon, EditIcon, CheckCircleIcon, ZapIcon } from '@/components/UI/GameIcons';
import styles from './ProfileCard.module.css';

interface ProfileCardProps {
  profile: ProfileMetadata;
  onUpdate: () => void;
  currency?: number; // Optional currency amount to display
}

export default function ProfileCard({ profile, onUpdate, currency }: ProfileCardProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(profile.name);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNameEdit = () => {
    setIsEditingName(true);
    setEditedName(profile.name);
    setError(null);
  };

  const handleNameSave = async () => {
    if (!editedName.trim()) {
      setError('Profile name cannot be empty');
      return;
    }

    if (editedName.trim() === profile.name) {
      setIsEditingName(false);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      updateProfileName(profile.id, editedName.trim());
      setIsEditingName(false);
      onUpdate();
    } catch (err: any) {
      setError(err.message || 'Failed to update profile name');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNameCancel = () => {
    setIsEditingName(false);
    setEditedName(profile.name);
    setError(null);
  };

  const handleNameKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSaving) {
      handleNameSave();
    } else if (e.key === 'Escape') {
      handleNameCancel();
    }
  };

  const handlePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      try {
        updateProfilePicture(profile.id, dataUrl);
        onUpdate();
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to update profile picture');
      }
    };
    reader.onerror = () => {
      setError('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePicture = () => {
    try {
      updateProfilePicture(profile.id, null);
      onUpdate();
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to remove profile picture');
    }
  };

  const handleConnectWallet = async () => {
    if (!isWalletAvailable()) {
      setError('No wallet found. Please install MetaMask or another Web3 wallet.');
      return;
    }

    setIsConnectingWallet(true);
    setError(null);

    try {
      const address = await connectWallet();
      if (!address) {
        throw new Error('Failed to get wallet address');
      }

      const profileId = getCurrentProfileId();
      if (!profileId) {
        setError('Please create or select a profile first');
        return;
      }

      // Check if wallet is already linked to another profile
      const existingProfile = getProfileByWalletAddress(address);
      if (existingProfile && existingProfile.id !== profileId) {
        setError(`This wallet is already linked to profile "${existingProfile.name}"`);
        return;
      }

      // Link wallet to current profile
      linkWalletToProfile(profileId, address);
      onUpdate();
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnectingWallet(false);
    }
  };

  const handleDisconnectWallet = () => {
    const profileId = getCurrentProfileId();
    if (profileId) {
      unlinkWalletFromProfile(profileId);
      onUpdate();
    }
  };

  // Generate default avatar based on name
  const getDefaultAvatar = (name: string) => {
    const initials = name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    return initials || '?';
  };

  return (
    <div className={styles.profileCard}>
      <div className={styles.cardContent}>
        {/* Profile Picture Section */}
        <div className={styles.pictureSection}>
          <div className={styles.pictureContainer}>
            {profile.profilePicture ? (
              <img
                src={profile.profilePicture}
                alt={profile.name}
                className={styles.profilePicture}
              />
            ) : (
              <div className={styles.defaultAvatar}>
                {getDefaultAvatar(profile.name)}
              </div>
            )}
          </div>
          <div className={styles.pictureControls}>
            <button
              className={styles.pictureEditButton}
              onClick={handlePictureClick}
              title="Change profile picture"
            >
              <CameraIcon size={18} />
            </button>
            {profile.profilePicture && (
              <button
                className={styles.pictureRemoveButton}
                onClick={handleRemovePicture}
                title="Remove profile picture"
              >
                <XIcon size={16} />
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePictureChange}
            style={{ display: 'none' }}
          />
        </div>

        {/* Profile Info Section */}
        <div className={styles.infoSection}>
          {/* Player Name */}
          <div className={styles.nameSection}>
            {isEditingName ? (
              <div className={styles.nameEditContainer}>
                <input
                  type="text"
                  className={styles.nameInput}
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onKeyDown={handleNameKeyPress}
                  maxLength={20}
                  autoFocus
                  disabled={isSaving}
                />
                <div className={styles.nameEditActions}>
                  <button
                    className={styles.saveButton}
                    onClick={handleNameSave}
                    disabled={isSaving || !editedName.trim()}
                  >
                    {isSaving ? '...' : <CheckCircleIcon size={20} />}
                  </button>
                  <button
                    className={styles.cancelButton}
                    onClick={handleNameCancel}
                    disabled={isSaving}
                  >
                    <XIcon size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.nameDisplayContainer}>
                <h2 className={styles.playerName}>{profile.name}</h2>
                <button
                  className={styles.editNameButton}
                  onClick={handleNameEdit}
                  title="Edit name"
                >
                  <EditIcon size={20} />
                </button>
              </div>
            )}
          </div>

          {/* Currency Section */}
          {currency !== undefined && (
            <div className={styles.currencySection}>
              <div className={styles.currencyDisplay}>
                <ZapIcon className={styles.currencyIcon} size={18} />
                <div className={styles.currencyInfo}>
                  <span className={styles.currencyLabel}>Currency</span>
                  <span className={styles.currencyAmount}>{currency.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Wallet Section */}
          <div className={styles.walletSection}>
            {profile.walletAddress ? (
              <div className={styles.walletConnected}>
                <div className={styles.walletInfo}>
                  <span className={styles.walletLabel}>Connected Wallet:</span>
                  <span className={styles.walletAddress}>{formatAddress(profile.walletAddress)}</span>
                </div>
                <button
                  className={styles.disconnectButton}
                  onClick={handleDisconnectWallet}
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <div className={styles.walletNotConnected}>
                <div className={styles.walletNotConnectedInfo}>
                  <span className={styles.walletLabel}>No wallet connected</span>
                  <p className={styles.walletDescription}>
                    Connect your wallet to link it with your profile and stats.
                  </p>
                </div>
                <button
                  className={styles.connectButton}
                  onClick={handleConnectWallet}
                  disabled={isConnectingWallet || !isWalletAvailable()}
                >
                  {isConnectingWallet ? 'Connecting...' : isWalletAvailable() ? 'Connect Wallet' : 'Wallet Not Available'}
                </button>
                {!isWalletAvailable() && (
                  <p className={styles.walletHint}>
                    Install MetaMask or another Web3 wallet to connect.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className={styles.error}>{error}</div>
          )}
        </div>
      </div>
    </div>
  );
}

