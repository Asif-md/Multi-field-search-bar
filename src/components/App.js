import React from "react"
import axios from "axios"

import { withStyles } from '@material-ui/core/styles';
import deburr from 'lodash/deburr';
import Autosuggest from 'react-autosuggest';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import MenuItem from '@material-ui/core/MenuItem';
import Popper from '@material-ui/core/Popper';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

const styles = theme => ({
    root: {
        width: '50%',
        margin: "0 auto"
    },
    suggestionsContainerOpen: {
        position: 'absolute',
        zIndex: 1,
        marginTop: theme.spacing.unit,
        left: 0,
        right: 0
    },
    suggestion: {
        display: 'block',
    },
    suggestionsList: {
        margin: 0,
        padding: 0,
        listStyleType: 'none',
        height: 300,
        overflowY: "auto"
    },
    card: {
        width: "100%",
    }
});



class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            filter: "",
            data: [],
            suggestions: [],
        }
    }


    renderInputComponent = (inputProps) => {
        const { classes, inputRef = () => { }, ref, ...other } = inputProps;

        return (
            <TextField
                fullWidth
                InputProps={{
                    inputRef: node => {
                        ref(node);
                        inputRef(node);
                    },
                    classes: {
                        input: classes.input,
                    },
                }}
                {...other}
            />
        );
    }


    renderSuggestion = (suggestion, { query, isHighlighted }) => {
        const suggestionText = `${suggestion.id} -- ${suggestion.name} -- ${suggestion.address} -- ${suggestion.pincode}`
        const matches = match(suggestionText, query);
        const parts = parse(suggestionText, matches);

        return (
            <MenuItem selected={isHighlighted} component="div">
                <Card>
                    <CardContent>
                        {parts.map((part, index) =>
                            part.highlight ? (
                                <span key={String(index)} style={{ fontWeight: 500 }}>
                                    {part.text}
                                </span>
                            ) : (
                                    <strong key={String(index)} style={{ fontWeight: 300 }}>
                                        {part.text}
                                    </strong>
                                ),
                        )}
                    </CardContent>
                </Card>
            </MenuItem>
        );
    }

    getSuggestionValue = (suggestion) => {
        return suggestion.name
    }

    getSuggestions = (value) => {
        const { data } = this.state
        const inputValue = deburr(value.trim()).toLowerCase();
        const inputLength = inputValue.length;

        return inputLength === 0 ? [] : data.filter(item => {
            return Object.keys(item).some(key => {
                return typeof item[key] === "string" && item[key].toLowerCase().includes(inputValue)
            });
        });
    }

    handleSuggestionsFetchRequested = ({ value }) => {
        this.setState({
            suggestions: this.getSuggestions(value),
        });
    };

    handleSuggestionsClearRequested = () => {
        this.setState({
            suggestions: []
        });
    };

    handleChange = name => (event, { newValue }) => {
        this.setState({
            [name]: newValue,
        });
    };

    getData = async () => {
        let url = "http://www.mocky.io/v2/5ba8efb23100007200c2750c"
        try {
            const results = await axios.get(url).then(res => res)
            this.setState({
                data: results.data
            })
        } catch (error) {
            console.log(error);
        }
    }

    componentDidMount() {
        this.getData()
    }

    render() {
        const { filter, suggestions } = this.state;
        const { classes } = this.props;

        return (
            <div className={classes.root}>
                <Autosuggest
                    renderInputComponent={this.renderInputComponent}
                    suggestions={suggestions}
                    onSuggestionsFetchRequested={this.handleSuggestionsFetchRequested}
                    onSuggestionsClearRequested={this.handleSuggestionsClearRequested}
                    getSuggestionValue={this.getSuggestionValue}
                    renderSuggestion={this.renderSuggestion}
                    inputProps={{
                        classes,
                        placeholder: 'Search users by ID, name, address, pincode',
                        value: filter,
                        onChange: this.handleChange('filter'),
                        inputRef: node => {
                            this.popperNode = node;
                        },
                        InputLabelProps: {
                            shrink: true,
                        },
                    }}
                    theme={{
                        suggestionsList: classes.suggestionsList,
                        suggestion: classes.suggestion,
                    }}
                    renderSuggestionsContainer={options => (
                        <Popper anchorEl={this.popperNode} open={Boolean(options.children)}>
                            <Paper
                                square
                                {...options.containerProps}
                                style={{ width: this.popperNode ? this.popperNode.clientWidth : null }}
                            >
                                {options.children}
                            </Paper>
                        </Popper>
                    )}
                />

            </div>
        );
    }
}

export default withStyles(styles)(App)