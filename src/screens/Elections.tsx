import React, { useContext, useEffect, useState } from "react"
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native"
import { Election, ElectionNavigatorParamList } from "../Types"
import { StackNavigationProp } from "@react-navigation/stack"
import { ActivityIndicator, Colors, FAB, Portal, Text } from "react-native-paper"
import ElectionListItem from "../components/ElectionListItem"
import useTheme from "../hooks/useTheme"
import PinKeyboard from "../components/PinKeyboard"
import * as storage from "../utils/storage"
import { AuthContext } from "../context/AuthContext"
import { MaterialCommunityIcons } from "@expo/vector-icons"

type Props = {
    navigation?: StackNavigationProp<ElectionNavigatorParamList>
}

export default function Elections (props: Props) {
    const {_user, unlockUser} = useContext(AuthContext)

    const [_refreshing, setRefreshing] = useState(false)
    const [_pinCodeVisibility, setPinCodeVisibility] = useState(!_user?.pinCode)
    const [_elections, setElections] = useState<Election[] | null>(null)

    const theme = useTheme()

    const openElectionDetails = (election: Election) => {
        props.navigation?.push("ElectionDetails", { ...election })
    }

    const closePinCode = async (pinCode?: string) => {
        if (pinCode) {
            unlockUser(pinCode)
            setPinCodeVisibility(false)
        }
    }

    const updateElections = async () => {
        setRefreshing(true)

        setElections((await storage.getItem("@elections")) || [])

        setRefreshing(false)
    }

    useEffect(() => {
        if (_user?.pinCode) {
            (async () => {
                setElections(await storage.getItem("@elections") || [])
            })()
        }
    }, [_user])

    return (
        <View style={styles.container}>
            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={_refreshing} onRefresh={updateElections} />
                }>

                { _elections && _elections.map((election: Election, index: number) =>
                    <View key={election.id}>
                        <ElectionListItem
                            election={election}
                            onClick={() => openElectionDetails(election)}
                        />
                        { index !== _elections.length - 1 &&
                                <View style={[
                                    styles.itemSeparator, 
                                    {borderBottomColor: theme.colors.border}
                                ]} />
                        }
                    </View>)
                }
            </ScrollView>

            {_elections && _elections.length === 0 &&
                <View style={styles.centerContent}>
                    <MaterialCommunityIcons size={60} color={theme.colors.placeholder} name="emoticon-sad-outline"/>
                    <Text style={{color: theme.colors.placeholder}}>No elections</Text>
                </View>
            }

            {!_elections &&
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color={theme.colors.placeholder}/>
                </View>
            }

            {_user &&
                <FAB style={[{backgroundColor: theme.colors.surface}, styles.fab]}
                    color={theme.colors.primary}
                    onPress={() => props.navigation?.navigate("CreateElection")}
                    label="Create"
                    icon="pencil"
                />
            }

            <Portal>
                <PinKeyboard visible={_pinCodeVisibility} onClose={closePinCode} closeOnBackButton={false}/>
            </Portal>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    centerContent: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: "center",
        justifyContent: "center"
    },
    fab: {
        position: "absolute",
        margin: 16,
        right: 0,
        bottom: 0
    },
    itemSeparator: {
        borderBottomWidth: .4,
        marginHorizontal: 16
    }
})
