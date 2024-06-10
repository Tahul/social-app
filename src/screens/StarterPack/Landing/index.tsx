import React from 'react'
import {ScrollView, View} from 'react-native'
import {LinearGradient} from 'expo-linear-gradient'
import {
  AppBskyActorDefs,
  AppBskyGraphDefs,
  AppBskyGraphStarterpack,
} from '@atproto/api'
import {msg, Trans} from '@lingui/macro'
import {useLingui} from '@lingui/react'
import {useNavigation} from '@react-navigation/native'
import {NativeStackScreenProps} from '@react-navigation/native-stack'

import {CommonNavigatorParams, NavigationProp} from 'lib/routes/types'
import {useSetUsedStarterPack} from 'state/preferences/starter-pack'
import {useResolveDidQuery} from 'state/queries/resolve-uri'
import {useStarterPackQuery} from 'state/queries/useStarterPackQuery'
import {useSession} from 'state/session'
import {useSetMinimalShellMode} from 'state/shell'
import {useLoggedOutViewControls} from 'state/shell/logged-out'
import {FeedSourceCard} from 'view/com/feeds/FeedSourceCard'
import {UserAvatar} from 'view/com/util/UserAvatar'
import {CenteredView} from 'view/com/util/Views'
import {Logo} from 'view/icons/Logo'
import {atoms as a, useTheme} from '#/alf'
import {Button, ButtonText} from '#/components/Button'
import {Divider} from '#/components/Divider'
import {ListMaybePlaceholder} from '#/components/Lists'
import {Text} from '#/components/Typography'

// const mockSP = {
//   uri: 'at://did:plc:t5nrviyjxkdhd5ymyra772dm/app.bsky.graph.starterpack/3kuec35ms422t',
//   cid: 'bafyreigrvmj3qd4urr5q6lqku7uzj4xmazepik6oobuxtvunx3g7d6e6xi',
//   record: {
//     list: 'at://did:plc:t5nrviyjxkdhd5ymyra772dm/app.bsky.graph.list/3kuec35kvkj2t',
//     name: 'Bluesky Team',
//     $type: 'app.bsky.graph.starterpack',
//     feeds: [
//       {
//         uri: 'at://did:plc:z72i7hdynmk6r22z27h6tvur/app.bsky.feed.generator/bsky-team',
//       },
//       {
//         uri: 'at://did:plc:oio4hkxaop4ao4wz2pp3f4cr/app.bsky.feed.generator/atproto',
//       },
//     ],
//     createdAt: '2024-06-07T19:43:07.211Z',
//     description:
//       'A starter pack including all the members of the Bluesky Team!',
//     descriptionFacets: [],
//   },
//   creator: {
//     did: 'did:plc:t5nrviyjxkdhd5ymyra772dm',
//     handle: 'haileyok.com',
//     displayName: 'hailey',
//     associated: {
//       chat: {
//         allowIncoming: 'following',
//       },
//     },
//     viewer: {
//       muted: false,
//       blockedBy: false,
//     },
//     labels: [],
//   },
//   feedCount: 0,
//   joinedAllTimeCount: 302,
//   joinedWeekCount: 143,
//   listItemCount: 2,
//   labels: [],
//   indexedAt: '2024-06-07T19:43:07.211Z',
//   feeds: [],
//   list: {
//     uri: 'at://did:plc:oisofpd7lj26yvgiivf3lxsi/app.bsky.graph.list/3kuc6z2xxd22j',
//     cid: 'bafyreibnigtususbzhjzadhsqconcf7s5wan6dl7h6s56jhxd6ebfvflrq',
//     name: 'Bluesky Team',
//     purpose: 'app.bsky.graph.defs#referencelist',
//     indexedAt: '2024-06-07T19:43:07.122Z',
//     labels: [],
//     viewer: {
//       muted: false,
//     },
//   },
//   listItemsSample: [
//     {
//       uri: 'at://did:plc:t5nrviyjxkdhd5ymyra772dm/app.bsky.graph.listitem/3kuec35m2o22t',
//       subject: {
//         did: 'did:plc:5warwwnoavxfhchjhcjlqyqi',
//         handle: 'bob.test',
//         displayName: 'Bob',
//         viewer: {
//           muted: false,
//           blockedBy: false,
//           following:
//             'at://did:plc:t5nrviyjxkdhd5ymyra772dm/app.bsky.graph.follow/3kudwno6ck22t',
//           followedBy:
//             'at://did:plc:5warwwnoavxfhchjhcjlqyqi/app.bsky.graph.follow/3kudwno6nbs2t',
//         },
//         labels: [],
//         description: 'Test user 2',
//         indexedAt: '2024-06-07T16:18:43.414Z',
//       },
//     },
//     {
//       uri: 'at://did:plc:t5nrviyjxkdhd5ymyra772dm/app.bsky.graph.listitem/3kuec35m2nz2t',
//       subject: {
//         did: 'did:plc:cvdwnci2mr5srh4slty7lndz',
//         handle: 'carla.test',
//         displayName: 'Carla',
//         viewer: {
//           muted: false,
//           blockedBy: false,
//           following:
//             'at://did:plc:t5nrviyjxkdhd5ymyra772dm/app.bsky.graph.follow/3kudwno6hgc2t',
//           followedBy:
//             'at://did:plc:cvdwnci2mr5srh4slty7lndz/app.bsky.graph.follow/3kudwno6x2c2t',
//         },
//         labels: [],
//         description: 'Test user 3',
//         indexedAt: '2024-06-07T16:18:43.462Z',
//       },
//     },
//   ],
// }

export function LandingScreen({
  route,
}: NativeStackScreenProps<CommonNavigatorParams, 'StarterPackLanding'>) {
  const {name, rkey} = route.params
  const navigation = useNavigation<NavigationProp>()
  const {currentAccount} = useSession()
  const setMinimalShellMode = useSetMinimalShellMode()

  const {
    data: did,
    isLoading: isLoadingDid,
    isError: isErrorDid,
  } = useResolveDidQuery(name)
  const {
    data: starterPack,
    isLoading: isLoadingStarterPack,
    isError: isErrorStarterPack,
  } = useStarterPackQuery({did, rkey})

  React.useEffect(() => {
    // if (currentAccount) {
    //   navigation.navigate('Home')
    //   return
    // }

    setMinimalShellMode(true)
    return () => {
      setMinimalShellMode(false)
    }
  }, [currentAccount, navigation, setMinimalShellMode])

  if (!did || !starterPack) {
    return (
      <ListMaybePlaceholder
        isLoading={isLoadingDid || isLoadingStarterPack}
        isError={isErrorDid || isErrorStarterPack}
      />
    )
  }

  return <LandingScreenInner starterPack={starterPack} />
}

function LandingScreenInner({
  starterPack,
}: {
  starterPack: AppBskyGraphDefs.StarterPackView
}) {
  const {record, creator, listItemsSample, feeds, joinedWeekCount} = starterPack
  const {_} = useLingui()
  const t = useTheme()
  const {requestSwitchToAccount} = useLoggedOutViewControls()
  const setUsedStarterPack = useSetUsedStarterPack()

  const gradient =
    t.name === 'light'
      ? [t.palette.primary_500, t.palette.primary_300]
      : [t.palette.primary_600, t.palette.primary_400]

  const sampleProfiles = listItemsSample?.map(item => item.subject)
  const userSets = {
    first: sampleProfiles?.slice(0, 4),
    second: sampleProfiles?.slice(4, 8),
  }

  if (!AppBskyGraphStarterpack.isRecord(record)) {
    return null
  }

  return (
    <CenteredView style={a.flex_1}>
      <ScrollView
        style={[a.flex_1]}
        contentContainerStyle={{paddingBottom: 100}}>
        <LinearGradient
          colors={gradient}
          style={[a.align_center, a.gap_sm, a.py_2xl]}>
          <View style={[a.flex_row, a.gap_md, a.pb_sm]}>
            <Logo width={76} fill="white" />
          </View>
          <View style={[a.align_center, a.gap_xs]}>
            <Text style={[a.font_bold, a.text_5xl, {color: 'white'}]}>
              {record.name}
            </Text>
            <Text style={[a.font_bold, a.text_md, {color: 'white'}]}>
              Starter pack by {creator.displayName || `@${creator.handle}`}
            </Text>
          </View>
        </LinearGradient>
        <View style={[a.gap_md, a.mt_lg, a.mx_lg]}>
          {!!joinedWeekCount && joinedWeekCount >= 50 && (
            <Text
              style={[a.text_md, a.text_center, t.atoms.text_contrast_medium]}>
              {joinedWeekCount} joined this week!
            </Text>
          )}
          <Button
            label={_(msg`Join Bluesky now`)}
            onPress={() => {
              setUsedStarterPack({
                uri: starterPack.uri,
                cid: starterPack.cid,
              })
              requestSwitchToAccount({requestedAccount: 'new'})
            }}
            variant="solid"
            color="primary"
            size="large">
            <ButtonText style={[a.text_lg]}>
              <Trans>Join Bluesky now</Trans>
            </ButtonText>
          </Button>
          <View style={[a.gap_xl, a.mt_md]}>
            <Text style={[a.text_md, t.atoms.text_contrast_medium]}>
              {record.description}
            </Text>
            <Divider />
            <Text />
            {starterPack.feeds?.length && (
              <View
                style={[
                  t.atoms.bg_contrast_25,
                  a.rounded_sm,
                  {pointerEvents: 'none'},
                ]}>
                {starterPack.feeds?.map(feed => (
                  <FeedSourceCard key={feed.uri} feedUri={feed.uri} />
                ))}
                {/*<FeedSourceCard*/}
                {/*  feedUri="at://did:plc:jfhpnnst6flqway4eaeqzj2a/app.bsky.feed.generator/for-science"*/}
                {/*  hideTopBorder={true}*/}
                {/*/>*/}
                {/*<FeedSourceCard feedUri="at://did:plc:upmfcx5muayjhkg5sltj625o/app.bsky.feed.generator/aaachrckxlsh2" />*/}
              </View>
            )}

            {sampleProfiles?.length && (
              <>
                <Text
                  style={[a.mt_sm, a.text_md, t.atoms.text_contrast_medium]}>
                  {feeds?.length ? (
                    <Trans>
                      You'll also follow these people and many others!
                    </Trans>
                  ) : (
                    <Trans>
                      Follow these people and many others to get started!
                    </Trans>
                  )}
                </Text>
                <View
                  style={[
                    t.atoms.bg_contrast_25,
                    a.rounded_sm,
                    a.px_xs,
                    a.py_md,
                    a.gap_xl,
                  ]}>
                  {!!userSets.first?.length && (
                    <ProfilesSet profiles={userSets.first} />
                  )}
                  {!!userSets.second?.length && (
                    <ProfilesSet profiles={userSets.second} />
                  )}
                </View>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </CenteredView>
  )
}

function User({displayName, avatar}: {displayName: string; avatar?: string}) {
  return (
    <View style={[a.flex_1, a.align_center, a.gap_sm]}>
      <UserAvatar size={64} avatar={avatar} />
      <Text style={[a.flex_1, a.text_sm, a.font_bold]} numberOfLines={1}>
        {displayName}
      </Text>
    </View>
  )
}

function ProfilesSet({
  profiles,
}: {
  profiles: AppBskyActorDefs.ProfileViewBasic[]
}) {
  return (
    <View style={[a.flex_row, a.gap_xs, a.align_center, a.justify_between]}>
      {profiles.map(profile => (
        <User
          key={profile.did}
          displayName={profile.displayName || `@${profile.handle}`}
          avatar={profile.avatar}
        />
      ))}
    </View>
  )
}