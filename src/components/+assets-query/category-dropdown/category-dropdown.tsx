import React, { useContext, useState } from 'react'

import { BEM } from '@nevermined-io/styles'
import Image from 'next/image'

import styles from './category-dropdown.module.scss'
import { User } from 'src/context'
import {categories} from 'src/config'

const b = BEM('category-dropdown', styles)

export function XuiCategoryDropdown() {
  const { selectedCategories, setSelectedCategories } = useContext(User)

  return (
    <div className={b('wrapper')}>
      <ul>
        {categories.map((category) => (
          <li
            key={category}
            onClick={() =>
              selectedCategories.includes(category)
                ? setSelectedCategories(
                    selectedCategories.filter((selectedCategory) => selectedCategory !== category)
                  )
                : setSelectedCategories(selectedCategories.concat(category))
            }
          >
            {category}
            <Image
              height="13px"
              src={
                selectedCategories.includes(category)
                  ? '/assets/checked_box.svg'
                  : '/assets/unchecked_box.svg'
              }
              width="13px"
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
