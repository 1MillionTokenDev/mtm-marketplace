import { Nevermined } from '@nevermined-io/nevermined-sdk-js'
import { WagmiCore } from '@nevermined-io/catalog-providers'
import { didZeroX } from '@nevermined-io/nevermined-sdk-js/dist/node/utils'

export const loadUserPublished = async (
  sdk: Nevermined,
  owner: string
): Promise<any | undefined> => {
  console.log('ENTRO')
  const registered = await sdk.keeper.didRegistry.events.getPastEvents({
    methodName: 'getDIDAttributeRegistereds',
    filterSubgraph: {
      where: {
        _owner: owner
      }
    },
    result: {
      _did: true,
      _owner: true,
      _lastUpdatedBy: true,
      _blockNumberUpdated: true
    }
  })

  console.log(registered)

  return registered
}

export const loadUserDownloads = async (
  sdk:Nevermined,
  userAddress: string
): Promise<any | undefined> => {

  const useds = sdk.keeper.didRegistry.events.getPastEvents({
    methodName: 'getUseds',
    filterSubgraph: {
      where: {
        _agentId: userAddress,
        _attributes: 'nft access'
      },
      orderBy: "_blockNumberUpdated" ,
      orderDirection: "desc"     
    },
    result: {
      id: true,
      _did: true,
      __typename: true,
      _attributes: true,
      _blockNumberUpdated: true,
      _agentId: true
    }

  })
  return useds
}

export const loadAssetProvenance = async (
  sdk:Nevermined,
  provider: WagmiCore.Provider,
  did: string
): Promise<any | undefined> => {

  let useds = sdk.keeper.didRegistry.events.getPastEvents({
    methodName: 'getUseds',
    filterSubgraph: {
      where: {
        _did: didZeroX(did)
      },
      orderBy: "_blockNumberUpdated" ,
      orderDirection: "desc"     
    },
    result: {
      id: true,
      _did: true,
      __typename: true,
      _attributes: true,
      _blockNumberUpdated: true,
      _agentId: true
    }

  });

  useds = Promise.all(
    (await useds).map( async(event) => {
    const block = await provider.getBlock(event._blockNumberUpdated.toNumber())
    return {...event, date: new Date(Number(block.timestamp) * 1000)}
  })
  )

  return useds
}
