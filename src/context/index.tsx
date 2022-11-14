/* eslint-disable @typescript-eslint/no-unused-vars */ 
import React from 'react'
import { DDO } from '@nevermined-io/nevermined-sdk-js'

export type SubscriptionTier = {
  name: string
  price: string
  symbol: string
  features: string[],
  enabled: boolean
}

export type DropDownFilters = {
  selectedNetworks: string[]
  selectedSubtypes: string[]
  fromDate: string
  toDate: string
}

export const User = React.createContext({
  isLogged: false,
  bookmarks: [] as DDO[],
  balance: {
    eth: 0,
    nevermined: 0
  },
  network: '',
  tokenSymbol: '',
  assets: [] as DDO[],
  setAssets: (assets: DDO[]) => {
    /* empty */
  },
  searchInputText: '',
  setSearchInputText: (searchInputText: string) => {
    /* empty */
  },
  fromDate: '',
  setFromDate: (fromDate: string) => {
    /* empty */
  },
  toDate: '',
  setToDate: (toDate: string) => {
    /* empty */
  },
  selectedCategories: [] as string[],
  setSelectedCategories: (selectedCategories: string[]) => {
    /* empty */
  },
  selectedNetworks: [] as string[],
  setSelectedNetworks: (selectedNetworks: string[]) => {
    /* empty */
  },
  selectedPrice: 0,
  setSelectedPriceRange: (selectedPrice: number) => {
    /* empty */
  },
  selectedSubscriptions: [] as string[],
  setSelectedSubscriptions: (selectedSubscriptions: string[]) => {
    /* empty */
  },
  selectedSubtypes: [] as string[],
  setSelectedSubtypes: (selectedSubtypes: string[]) => {
    /* empty */
  },
  setBookmarks: (bookmarks: DDO[]) => {
    /* empty */
  },
  dropdownFilters: {} as DropDownFilters,
  applyDropdownFilters: () => {
    /* empty */
  },
  clearDropdownFilters: () => {
    /* empty */
  }
})
