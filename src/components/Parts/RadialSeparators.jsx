import React from "react";
import _ from "lodash";

class Separator extends React.Component {
    render() {
        return (
            <div
                style={{
                    position: "absolute",
                    height: "100%",
                    transform: `rotate(${this.props.turns}turn)`
                }}
            >
                <div style={this.props.style} />
            </div>
        );
    }
}

class RadialSeparators extends React.Component {
    render() {
        const turns = 1 / this.props.count;
        return _.range(this.props.count).map(index => (
            <Separator key={index} turns={index * turns} style={this.props.style} />
        ));
    }
}

export default RadialSeparators;