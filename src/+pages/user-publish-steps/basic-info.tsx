import React, { useState } from 'react'
import {
  UiFormGroup,
  UiFormInput,
  UiFormTextarea,
  UiForm,
  Orientation,
  UiButton,
  UiText,
  UiDivider,
  UiFormSelect,
  BEM
} from '@nevermined-io/styles'
import styles from './user-publish.module.scss'
import stepStyles from './step-content.module.scss'
import { AssetService } from '@nevermined-io/catalog-core'
import {categories} from 'src/config'
import { Access } from '../../shared'

const b = BEM('user-publish', styles)
const step = BEM('step-container', stepStyles)

interface BasicInfoProps {
  nextStep: () => void
}

export const BasicInfoStep = (props: BasicInfoProps) => {
  const { assetPublish, handleChange } = AssetService.useAssetPublish()
  const { nextStep } = props
  const [authorInputError, setAuthorInputError] = useState('')
  const [nameInputError, setNameInputError] = useState('')
  const [descriptionInputError, setDescriptionInputError] = useState('')
  const [categoryInputError, setCategoryInputError] = useState('')
  const access = [Access.public, Access.private]

  const checkValues = (): boolean => {
    if (!assetPublish.author) {
      setAuthorInputError('Author is required')
      return false
    }

    if (!assetPublish.name) {
      setNameInputError('Name is required')
      return false
    }

    if (!assetPublish.description) {
      setDescriptionInputError('Description is required')
      return false
    }

    if (!assetPublish.category) {
      setCategoryInputError('Category is required')
    }

    return true
  }

  const handleContinueClick = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!checkValues()) return

    nextStep()
  }

  return (
    <>
      <div className={step('step-title')}>
        <span className={step('step-title-icon')}>1</span>
        <UiText className={step('step-title-text')} type="caps" wrapper="span">
          Basic Info
        </UiText>
      </div>
      <UiDivider type="l" />
      <UiForm>
        <UiFormGroup orientation={Orientation.Vertical} className={b('publish-form')}>
          <UiFormInput
            className={b('publish-form-input')}
            label="Author *"
            inputError={authorInputError}
            value={assetPublish.author}
            onChange={(e) => handleChange(e.target.value, 'author')}
            placeholder="Type the author"
          />
        </UiFormGroup>
        <UiFormGroup orientation={Orientation.Vertical} className={b('publish-form')}>
          <UiFormInput
            className={b('publish-form-input')}
            label="Name *"
            inputError={nameInputError}
            value={assetPublish.name}
            onChange={(e) => handleChange(e.target.value, 'name')}
            placeholder="Type a name for the Asset"
            maxLength={40}
          />
        </UiFormGroup>
        <UiFormGroup orientation={Orientation.Vertical} className={b('publish-form')}>
          <UiFormTextarea
            className={b('publish-form-input')}
            label="Description *"
            inputError={descriptionInputError}
            value={assetPublish.description}
            onChange={(e) => handleChange(e.target.value, 'description')}
            placeholder="Type a description"
          />
        </UiFormGroup>
        <UiFormGroup orientation={Orientation.Vertical} className={b('publish-form')}>
          <UiFormSelect
            value={assetPublish.category}
            onChange={(e) => handleChange(e as string, 'category')}
            options={categories}
            className={b('publish-form-select')}
            label="Category"
            inputError={categoryInputError}
          />
        </UiFormGroup>

        <UiFormGroup orientation={Orientation.Vertical} className={b('publish-form')}>
          <UiFormSelect
            value={assetPublish.access}
            onChange={(e) => handleChange(e as string, 'access')}
            options={access}
            className={b('publish-form-select')}
            label="Access"
          />
        </UiFormGroup>

        <UiDivider />

        <UiFormGroup orientation={Orientation.Vertical}>
          <UiButton onClick={handleContinueClick} className={b('button')}>
            Continue
          </UiButton>
        </UiFormGroup>
      </UiForm>
    </>
  )
}
