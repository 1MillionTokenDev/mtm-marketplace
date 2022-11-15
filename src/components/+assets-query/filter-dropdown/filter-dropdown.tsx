import React, { useContext } from 'react'
import { BEM, UiLayout } from '@nevermined-io/styles'
import { XuiDatePicker } from './date-picker'
import styles from './filter-dropdown.module.scss'
import { XuiPriceRangeSelector } from './price-range-selector'
import { User } from 'src/context'

const b = BEM('filter-dropdown', styles)

export function XuiFilterDropdown() {
  const { clearDropdownFilters, applyDropdownFilters, setSelectedPriceRange } = useContext(User)

  const setPriceRange = (price: number) => {
    setSelectedPriceRange(price)
  }

  return (
    <UiLayout type="grid" className={b('wrapper')}>
      <div className={b('controls')}>
        <XuiPriceRangeSelector setPriceRange={setPriceRange}/>
        <XuiDatePicker />
      </div>
      <div className={b('buttons')}>
        <button className={b('button', ['clear'])} onClick={clearDropdownFilters}>
          Clear
        </button>
        <button className={b('button', ['apply'])} onClick={applyDropdownFilters}>
          Apply Filters
        </button>
      </div>
    </UiLayout>
  )
}
