import React, { useContext, useEffect, useState, useRef, ReactNode, useCallback } from 'react'
import { DDO } from '@nevermined-io/nevermined-sdk-js'
import { useWallet } from '@nevermined-io/catalog-providers'
import { Catalog, AuthToken } from '@nevermined-io/catalog-core'
import { User, DropDownFilters } from '.'
import { correctNetworkName } from '../config'

import {
  neverminedNodeUri,
  marketplaceUri,
  neverminedNodeAddress,
  faucetUri,
  secretStoreUri,
  verbose,
  graphUrl,
  artifactsFolder
} from '../config'

const window = global.window || ({} as any)

interface UserProviderProps {
  children: ReactNode
}

const UserProvider = (props: UserProviderProps) => {
  const [isLogged, setIsLogged] = useState(false)
  const [bookmarks, setBookmarks] = useState<DDO[]>([])
  const [balance, setBalance] = useState<{ eth: any; nevermined: any }>({
    eth: 0,
    nevermined: 0
  })
  const [network, setNetwork] = useState('')
  const [tokenSymbol, setTokenSymbol] = useState('')
  const [assets, setAssets] = useState<DDO[]>([])
  const [searchInputText, setSearchInputText] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedNetworks, setSelectedNetworks] = useState<string[]>([])
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<string[]>([])
  const [selectedSubtypes, setSelectedSubtypes] = useState<string[]>([])
  const [selectedPrice, setSelectedPrice] = useState<number>(0)
  const { sdk, updateSDK, isLoadingSDK } = Catalog.useNevermined()
  const { walletAddress, getStatus } = useWallet()
  const userProviderMounted = useRef()
  const [dropdownFilters, setDropDownFilters] = useState<DropDownFilters>({
    fromDate: '',
    toDate: ''
  })

  useEffect(() => {
    if (isLoadingSDK || !network) {
      return
    }

    (async () => {
      if (userProviderMounted) {
        (window?.ethereum as any)?.on('accountsChanged', async () => {
          fetchBalance()
        })

        if ((window?.ethereum as any)?.on) {
          (window?.ethereum as any)?.on('chainChanged', async () => {
            await reloadSdk()
          })
        }
      }
    })()
  }, [isLoadingSDK, network])

  useEffect(() => {
    const sdkHandler = async () => {
      const networkState = await sdk?.keeper?.getNetworkName()
      if (networkState) setNetwork(networkState)
      await loadNevermined()
    }

    sdkHandler()
  }, [sdk])

  useEffect(() => {
    if (getStatus() === 'disconnected') {
      setIsLogged(false)
      return
    }

    (async () => {
      const isLoggedState = getStatus()
      setIsLogged(isLoggedState === 'connected')
      if (isLoggedState === 'connected') {
        await loadNevermined()
      }
    })()
  }, [walletAddress])

  const reloadSdk = async () => {
    const config = {
      web3Provider: window.ethereum,
      nodeUri: network,
      marketplaceUri,
      neverminedNodeUri,
      faucetUri,
      neverminedNodeAddress,
      secretStoreUri,
      verbose,
      marketplaceAuthToken: AuthToken.fetchMarketplaceApiTokenFromLocalStorage().token || '',
      artifactsFolder,
      graphHttpUri: graphUrl
    }

    updateSDK(config)
  }

  const fetchTokenSymbol = async (): Promise<void> => {
    let tokenSymbolState = 'Unknown'
    if (sdk?.keeper && sdk.keeper.token) {
      tokenSymbolState = await sdk.token.getSymbol()
    }
    tokenSymbol !== tokenSymbol && setTokenSymbol(tokenSymbolState)
  }

  const loadNevermined = async (): Promise<void> => {
    const network = await sdk?.keeper?.getNetworkName()
    await fetchBalance()
    if (network === correctNetworkName) {
      fetchTokenSymbol()
    }
  }

  const fetchBalance = async () => {
    try {
      const account = (await sdk.accounts?.list())?.find((a) => a.getId() === walletAddress)

      if (account) {
        const balance = await account.getBalance()
        const { eth, nevermined } = balance
        if (eth !== balance.eth || nevermined !== balance.nevermined) {
          setBalance({ eth, nevermined })
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  const setSelectedPriceRange = (selectedPrice: number) => {
    setSelectedPrice(selectedPrice)
  }

  const applyDropdownFilters = useCallback(() => {
    setDropDownFilters({
      fromDate,
      toDate
    })
  }, [fromDate, toDate])

  const clearDropdownFilters = useCallback(() => {
    const dropdownFilters = {
      selectedNetworks: [],
      selectedSubscriptions: [],
      selectedSubtypes: [],
      fromDate: '',
      toDate: ''
    }
    setSelectedNetworks(dropdownFilters.selectedNetworks)
    setSelectedSubscriptions(dropdownFilters.selectedSubscriptions)
    setSelectedSubtypes(dropdownFilters.selectedSubtypes)
    setFromDate(dropdownFilters.fromDate)
    setToDate(dropdownFilters.toDate)
    setDropDownFilters(dropdownFilters)
  }, [])

  return (
    <User.Provider
      value={{
        isLogged,
        bookmarks,
        setBookmarks,
        balance,
        network,
        tokenSymbol,
        assets,
        setAssets,
        searchInputText,
        setSearchInputText,
        fromDate,
        setFromDate,
        toDate,
        setToDate,
        selectedCategories,
        setSelectedCategories,
        selectedNetworks,
        setSelectedNetworks,
        selectedPrice,
        setSelectedPriceRange: (selectedPrice: number) => setSelectedPriceRange(selectedPrice),
        selectedSubscriptions,
        setSelectedSubscriptions,
        selectedSubtypes,
        setSelectedSubtypes,
        dropdownFilters,
        applyDropdownFilters,
        clearDropdownFilters
      }}
    >
      {props.children}
    </User.Provider>
  )
}

export default UserProvider
