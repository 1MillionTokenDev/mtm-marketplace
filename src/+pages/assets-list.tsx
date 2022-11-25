import React, { useRef, useContext, useEffect, useState } from 'react'
import { DDO, Profile } from '@nevermined-io/nevermined-sdk-js'
import {
  BEM,
  UiPopupHandlers,
  NotificationPopup
} from '@nevermined-io/styles'
import styles from './assets-list.module.scss'
import { User } from '../context'
import { Catalog } from '@nevermined-io/catalog-core'
import { useWallet } from '@nevermined-io/catalog-providers'
import { XuiDownloadAsset } from '../components/+download-asset/download-asset'
import { toast } from '../components'

const b = BEM('assets-list', styles)

export const AssetsList = () => {
  const {
    bookmarks,
    setBookmarks,
  } = useContext(User)
  const { walletAddress } = useWallet()
  const { sdk, account } = Catalog.useNevermined()
  const [userProfile, setUserProfile] = useState<Profile>({} as Profile)
  const [errorMessage, setErrorMessage] = useState('')
  const [assetDid, setAssetDid] = useState<string>('')
  const popupRef = useRef<UiPopupHandlers>()
  const downloadPopupRef = useRef<UiPopupHandlers>()

  const closePopup = (event: any) => {
    popupRef.current?.close()
    event.preventDefault()
  }

  const checkAuth = async () => {
    let auth = true
    if (!account.isTokenValid()) {
      auth = false
      setErrorMessage(
        'Your login is expired. Please first sign with your wallet and after try again'
      )
      popupRef.current?.open()
      await account.generateToken()
      popupRef.current?.close()
      return auth
    }

    return auth
  }

  const onAddBookmark = async (did: string, description: string) => {
    if (!walletAddress) {
      toast.error('Please connect your wallet.')
      return
    }

    try {
      const wasAuth = await checkAuth()
      if (!wasAuth) return
      const bookmark = await sdk.bookmarks.create({
        did,
        userId: userProfile.userId,
        description
      })

      const bookmarkDDO = await sdk.assets.resolve(bookmark.did)

      setBookmarks([...bookmarks, bookmarkDDO])
    } catch (error: any) {
      console.error(error.message)
      setErrorMessage('Error in adding bookmark')
      popupRef.current?.open()
    }
  }

  const onRemoveBookmark = async (did: string) => {
    try {
      const bookmarkDDO = bookmarks.find((item) => item.id === did)

      if (bookmarkDDO?._nvm.userId) {
        const bookmarksData = await sdk.bookmarks.findManyByUserId(bookmarkDDO?._nvm.userId)

        const bookmark = bookmarksData.results.find((b) => b.did === did)

        if (bookmark?.id) {
          const wasAuth = await checkAuth()
          if (!wasAuth) return wasAuth
          await sdk.bookmarks.deleteOneById(bookmark.id)
          setBookmarks(bookmarks.filter((item) => item.id !== bookmarkDDO.id))
        }
      }
    } catch (error: any) {
      console.error(error.message)
      setErrorMessage('Error in removing bookmark')
      popupRef.current?.open()
    }
  }

  type AssetInfo = { did: string }

  const downloadAsset = async (assetInfo: AssetInfo) => {
    setAssetDid(assetInfo.did)

    downloadPopupRef.current?.open()
  }

  useEffect(() => {
    if (!sdk?.profiles) {
      return
    }

    (async () => {
      if (!walletAddress) {
        return
      }
      try{
          const userProfile = await sdk.profiles.findOneByAddress(walletAddress)
          if (!userProfile?.userId) {
            return
          }
          const bookmarksData = await sdk.bookmarks.findManyByUserId(userProfile.userId)
          const bookmarksDDO = await Promise.all(
            bookmarksData.results?.map((bookmark) => sdk.assets.resolve(bookmark.did))
          )
          setBookmarks([...bookmarksDDO])
          setUserProfile(userProfile)
      }catch(error: unknown){
          console.error("Error loading user info: " + error)
      }
    })()
  }, [sdk])

  return (
    <div className={b()}>
      <XuiDownloadAsset popupRef={downloadPopupRef} assetDid={assetDid} />
      <NotificationPopup closePopup={closePopup} message={errorMessage} popupRef={popupRef} />
    </div>
  )
}
