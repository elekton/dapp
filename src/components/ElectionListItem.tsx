import React, {useEffect, useState} from 'react';
import {Colors, List, ProgressBar, TouchableRipple} from 'react-native-paper';
import {StyleSheet, Text, View} from "react-native";
import {format} from "date-fns";
import useTheme from "../hooks/useTheme";
import {Election} from "../Types";

type Props = {
    value: Election
    onClick: (id: number) => void
}

export default function ElectionListItem({value, onClick}: Props) {
    const theme = useTheme()

    const calculateTimeLeft = () => {
        return (Date.now() - value.startDate) / (value.endDate - value.startDate)
    }

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        // Clear timeout if the component is unmounted.
        return () => clearTimeout(timer);
    });

    return (
        <TouchableRipple onPress={() => onClick(value.id)}>
            <View>
                <List.Item title={value.title} description={value.description}
                           right={() =>
                               <View style={styles.date}>
                                   <Text style={[{color: theme.colors.placeholder}, styles.dateText]}>
                                       {format(value.startDate, "mm/dd/yyyy")}
                                   </Text>
                                   <Text style={[{color: theme.colors.placeholder}, styles.dateText]}>
                                       {format(value.startDate, "HH:mm a")}
                                   </Text>
                               </View>
                           }/>
                <View>{
                    timeLeft > 0 && timeLeft < 1 &&
                    <ProgressBar style={styles.timer} progress={timeLeft}
                                 color={timeLeft < 0.8 ? Colors.green800 : Colors.red800}/>
                }</View>
            </View>
        </TouchableRipple>
    );
};

const styles = StyleSheet.create({
    timer: {
        marginHorizontal: 16,
        marginBottom: 16
    },
    date: {
        justifyContent: "center",
        paddingRight: 10,
        alignItems: "flex-end"
    },
    dateText: {
        fontSize: 13
    }
});