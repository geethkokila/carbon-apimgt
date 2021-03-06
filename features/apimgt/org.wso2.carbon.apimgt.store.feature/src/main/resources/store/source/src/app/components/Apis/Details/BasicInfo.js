/*
 * Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, {Component} from 'react'
import {Link} from 'react-router-dom'
import {Col, Popconfirm, Row, Form, Dropdown, Tag, Menu, Badge, message} from 'antd';

const FormItem = Form.Item;
import Loading from '../../Base/Loading/Loading'
import ResourceNotFound from "../../Base/Errors/ResourceNotFound";
import Api from '../../../data/api'

import {withStyles} from 'material-ui/styles';
import Paper from 'material-ui/Paper';
import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import Dialog, {DialogActions, DialogContent, DialogContentText, DialogTitle} from 'material-ui/Dialog';
import Card, {CardActions, CardContent, CardMedia} from 'material-ui/Card';
import {MenuItem} from 'material-ui/Menu';
import Table, {TableBody, TableCell, TableRow} from 'material-ui/Table';
import Select from 'material-ui/Select';
import 'react-select/dist/react-select.css';
import {FormControl} from 'material-ui/Form';
import NotificationSystem from 'react-notification-system';
import FavoriteIcon from 'material-ui-icons/Favorite';
import ShareIcon from 'material-ui-icons/Share';
import IconButton from 'material-ui/IconButton';
import Divider from 'material-ui/Divider';
import CodeIcon from 'material-ui-icons/Code';
import Input, {InputLabel} from 'material-ui/Input';
import EmailIcon from 'material-ui-icons/Email';
import Slide from "material-ui/transitions/Slide";
import Popover from 'material-ui/Popover';

const styles = theme => ({
    media: {
        height: 200,
    },
});

class BasicInfo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            api: null,
            applications: null,
            policies: null,
            dropDownApplications: null,
            dropDownPolicies: null,
            notFound: false,
            openSubscribeMenu: false,
            matDropVisible: false,
            matDropValue: 'one',
            subscribedApplicationIds: [],
            options: [],
            tiers: [],
            applicationId: null,
            policyName: null,
            openPopup: false,
            anchorEl: null
        };
        this.api_uuid = this.props.uuid;
        this.logChange = this.logChange.bind(this);
        this.openSubscribeMenu = this.openSubscribeMenu.bind(this);
        this.closeSubscribeMenu = this.closeSubscribeMenu.bind(this);
        this.handlePopupOpen = this.handlePopupOpen.bind(this);
        this.handlePopupClose = this.handlePopupClose.bind(this);
    }

    componentDidMount() {
        const api = new Api();
        let promised_api = api.getAPIById(this.api_uuid);
        promised_api.then(
            response => {
                console.info(response.obj);
                this.setState({api: response.obj});
                let apiTiers = response.obj.policies;
                let tiers = [];
                for (let i = 0; i < apiTiers.length; i++) {
                    let tierName = apiTiers[i];
                    tiers.push({value: tierName, label: tierName});
                }
                this.setState({tiers: tiers});
                if (tiers.length > 0) {
                    this.setState({policyName: tiers[0].value});
                }
            }
        ).catch(
            error => {
                if (process.env.NODE_ENV !== "production") {
                    console.log(error);
                }
                let status = error.status;
                if (status === 404) {
                    this.setState({notFound: true});
                }
            }
        );

        let existing_subscriptions = api.getSubscriptions(this.api_uuid, null);
        existing_subscriptions.then((response) => {
            let subscribedApplications = [];
            //get the application IDs of existing subscriptions
            response.body.list.map(element => subscribedApplications.push(element.applicationId));
            this.setState({subscribedApplicationIds: subscribedApplications});
        }).catch(
            error => {
                if (process.env.NODE_ENV !== "production") {
                    console.log(error);
                }
                let status = error.status;
                if (status === 404) {
                    this.setState({notFound: true});
                }
            }
        );

        let promised_applications = api.getAllApplications();
        promised_applications.then(
            (response) => {
                let applicationResponseObj = response.body;
                let applications = [];
                for (let i = 0; i < applicationResponseObj.list.length; i++) {
                    let applicationId = applicationResponseObj.list[i].applicationId;
                    let applicationName = applicationResponseObj.list[i].name;
                    //include the application only if it does not has an existing subscriptions
                    if (this.state.subscribedApplicationIds.includes(applicationId)) {
                        continue;
                    } else {
                        applications.push({value: applicationId, label: applicationName});
                    }
                }
                this.setState({options: applications});
                if (options.length > 0) {
                    this.setState({applicationId: options[0].value});
                }
            }
        ).catch(
            error => {
                if (process.env.NODE_ENV !== "production") {
                    console.log(error);
                }
                let status = error.status;
                if (status === 404) {
                    this.setState({notFound: true});
                }
            }
        );

        let promised_subscriptions = api.getSubscriptions(this.api_uuid, null);
        promised_subscriptions.then(
            response => {
                this.dropDownApplications = [<Option key="custom" onClick={this.handleClick}>New Application</Option>];

                for (var i = 0; i < this.api.policies.length; i++) {
                    this.dropDownPolicies.push(<Option key={this.api.policies[i]}>{this.api.policies[i]}</Option>);
                }
                var subscription = {};
                var subscriptions = response.obj.list;
                var application = {};
                var subscribedApp = false;
                for (var i = 0; i < this.applications.length; i++) {
                    subscribedApp = false;
                    application = applications[i];
                    if (application.lifeCycleStatus != "APPROVED") {
                        continue;
                    }
                    for (var j = 0; j < subscriptions.length; j++) {
                        subscription = subscriptions[j];
                        if (subscription.applicationId === application.applicationId) {
                            subscribedApp = true;
                            continue;
                        }
                    }
                    if (!subscribedApp) {
                        this.dropDownApplications.push(<Option key={application.id}>{application.name}</Option>);
                    }
                }
                this.policies = this.api.policies;
                console.info(this.api.policies)
            }
        ).catch(
            error => {
                if (process.env.NODE_ENV !== "production") {
                    console.log(error);
                }
                let status = error.status;
                if (status === 404) {
                    this.setState({notFound: true});
                }
            }
        );
    }

    handleChange = name => event => {
        this.setState({[name]: event.target.value});
    };

    addNotifications() {
        this.refs.notificationSystem.addNotification({
            message: 'Subscribe to API successfully',
            position: 'tc',
            level: 'success'
        });
    };

    createSubscription = (e) => {
        e.preventDefault();
        let apiId = this.api_uuid;
        let applicationId = this.state.applicationId;
        let policy = this.state.policyName;
        let api = new Api();
        let promised_subscribe = api.subscribe(apiId, applicationId, policy);
        promised_subscribe.then(response => {
            console.log("Subscription created successfully with ID : " + response.body.subscriptionId);
            this.addNotifications();
            let applications = this.state.options.filter(application => applicationId !== application.value);
            this.setState({options: applications, openSubscribeMenu: false});
        }).catch(error => {
                console.log("Error while creating the subscription.");
                console.error(error);
            }
        )
    };

    populateApplicationDropdown() {
        return this.dropDownApplications;
    }

    populatePolicyDropdown() {
        return this.dropDownPolicies;
    }

    handleClick() {
        this.setState({redirect: true});
    }

    openSubscribeMenu() {
        this.setState({openSubscribeMenu: true});
    }

    closeSubscribeMenu() {
        this.setState({openSubscribeMenu: false});
    }

    handlePopupClose() {
        this.setState({openPopup: false});
    };

    handlePopupOpen(event) {
        this.setState({openPopup: true, anchorEl: event.currentTarget});
    };
    selectChange() {
        this.setState({matDropVisible: !this.state.matDropVisible})
    }

    onBlur(e) {
        console.info(document.activeElement);
        if (!e.currentTarget.contains(document.activeElement)) {
            this.setState({matDropVisible: false});
        }
    }

    selectOption(option) {
        console.info(option);
        this.setState({selectOption: option});
    }

    logChange(val) {
        this.setState({matDropValue: val.value});
        console.log("Selected: " + JSON.stringify(val));
    }

    render() {
        const formItemLayout = {
            labelCol: {span: 6},
            wrapperCol: {span: 18}
        };
        if (this.state.notFound) {
            return <ResourceNotFound/>
        }
        if (this.state.redirect) {
            return <Redirect push to="/application-create"/>;
        }
        const {classes} = this.props;
        const api = this.state.api;

        return (
            this.state.api ?
                <div>
                    <Grid container className="tab-grid" spacing={0}>
                        {/*<Button aria-owns="simple-menu" aria-haspopup="true" >
                         <Edit /> Edit
                         </Button>
                         <Button aria-owns="simple-menu" aria-haspopup="true" >
                         <CreateNewFolder /> Create New Version
                         </Button>
                         <Button aria-owns="simple-menu" aria-haspopup="true" >
                         <Description /> View Swagger
                         </Button>*/}
                        <Grid item xs={12} sm={12} md={6} lg={3} xl={2}>
                            <Card>
                                <CardMedia className={classes.media}
                                           image="/store/public/app/images/api/api-default.png"
                                           title="API icon"
                                />
                                <CardContent>
                                    <Typography type="subheading" component="h2">
                                        {api.name}
                                    </Typography>
                                    <Typography type="body 2" color="secondary">
                                        {api.version} by {api.provider}
                                    </Typography>
                                    <StarRatingBar apiIdProp={this.api_uuid}></StarRatingBar>
                                </CardContent>
                                <Divider/>
                                <CardActions disableActionSpacing>
                                    <IconButton aria-label="Add to favorites">
                                        <FavoriteIcon/>
                                    </IconButton>
                                    <IconButton aria-label="Share" onClick={this.handlePopupOpen}>
                                        <Popover
                                            open={this.state.openPopup}
                                            anchorEl={this.state.anchorEl}
                                            onClose={this.handlePopupClose}>
                                            <div id="share_div_social" className="share_dives">
                                                {/* Facebook */}
                                                <a className="social_links" id="facebook"
                                                   href="http://www.facebook.com/sharer.php?u=https%3A%2F%2F172.17.0.1%3A9444%2Fstore%2Fapis%2Finfo%3Fname%3Dfoo%26version%3D1.0.0%26provider%3Dadmin"
                                                   target="_blank" title="facebook">
                                                    <img src="/store/public/app/images/social/facebook.png" alt="Facebook" />
                                                </a>
                                                {/* Twitter */}
                                                <a className="social_links" id="twitter"
                                                   href="http://twitter.com/share?url=https%3A%2F%2F172.17.0.1%3A9444%2Fstore%2Fapis%2Finfo%3Fname%3Dfoo%26version%3D1.0.0%26provider%3Dadmin&text=API%20Store%20-%20foo%20%3A%20try%20this%20API%20at%20https%3A%2F%2F172.17.0.1%3A9444%2Fstore%2Fapis%2Finfo%3Fname%3Dfoo%26version%3D1.0.0%26provider%3Dadmin"
                                                   target="_blank" title="twitter">
                                                    <img src="/store/public/app/images/social/twitter.png" alt="Twitter" /></a>
                                                {/* Google+ */}
                                                <a className="social_links" id="googleplus"
                                                   href="https://plus.google.com/share?url=https%3A%2F%2F172.17.0.1%3A9444%2Fstore%2Fapis%2Finfo%3Fname%3Dfoo%26version%3D1.0.0%26provider%3Dadmin"
                                                   target="_blank" title="googleplus">
                                                    <img src="/store/public/app/images/social/google.png" alt="Google" /></a>
                                                {/* Digg */}
                                                <a className="social_links" id="digg"
                                                   href="http://www.digg.com/submit?url=https%3A%2F%2F172.17.0.1%3A9444%2Fstore%2Fapis%2Finfo%3Fname%3Dfoo%26version%3D1.0.0%26provider%3Dadmin"
                                                   target="_blank" title="digg">
                                                    <img src="/store/public/app/images/social/diggit.png" alt="Digg" /></a>
                                                <div className="clearfix">
                                                </div>
                                            </div>
                                        </Popover>
                                        <ShareIcon/>
                                    </IconButton>
                                    <IconButton aria-label="Embed">
                                        <CodeIcon/>
                                    </IconButton>
                                    <IconButton aria-label="Email">
                                        <EmailIcon/>
                                    </IconButton>
                                </CardActions>
                            </Card>
                            <Button onClick={this.openSubscribeMenu} color="accent" raised
                                    className="form-buttons full-width"> Subscribe to an Application </Button>
                        </Grid>
                        <Grid item xs={12} sm={12} md={6} lg={4} xl={4} className="add-item-left-padding ">
                            <Dialog open={this.state.openSubscribeMenu} transition={Slide}
                                    onClose={this.closeSubscribeMenu}>
                                <DialogTitle>
                                    {"Subscribe"}
                                </DialogTitle>
                                <DialogContent>
                                    <DialogContentText>
                                        Select the Application name and Tier to Subscribe to an Application
                                    </DialogContentText>
                                    {this.state.options &&
                                    <FormControl style={{width: "100%", marginBottom: "20px"}}
                                                 className={classes.formControl}>
                                        <InputLabel>Applications</InputLabel>
                                        <Select
                                            style={{width: "100%"}}
                                            value={this.state.applicationId}
                                            onChange={this.handleChange('applicationId')}
                                        >
                                            {this.state.options.map((option) => <MenuItem key={option.value}
                                                                                          value={option.value}>
                                                {option.label}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                    }
                                    {this.state.tiers &&
                                    <FormControl style={{width: "100%"}}>
                                        <InputLabel>Tiers</InputLabel>
                                        <Select
                                            style={{width: "100%"}}
                                            value={this.state.policyName}
                                            onChange={this.handleChange('policyName')}
                                        >
                                            {this.state.tiers.map((tier) => <MenuItem key={tier.value}
                                                                                      value={tier.value}>
                                                {tier.label}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                    }
                                    <br/>
                                </DialogContent>
                                <DialogActions>
                                    <Button onClick={this.closeSubscribeMenu} color="primary">
                                        <NotificationSystem ref="notificationSystem"/>
                                        Cancel
                                    </Button>
                                    <Button onClick={this.createSubscription} color="primary">
                                        <NotificationSystem ref="notificationSystem"/>
                                        Subscribe
                                    </Button>
                                </DialogActions>
                            </Dialog>
                            <Table>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>
                                            Status</TableCell><TableCell><Badge status="processing"
                                                                                text={api.lifeCycleStatus}/></TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Context</TableCell><TableCell>{api.context}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Default API
                                            Version</TableCell><TableCell>{api.isDefaultVersion}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Date Created</TableCell><TableCell>{api.createdTime}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Date Last
                                            Updated</TableCell><TableCell>{api.lastUpdatedTime}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Rate it</TableCell>
                                        <TableCell>
                                            <StarRatingBar apiIdProp={this.api_uuid}></StarRatingBar>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </Grid>
                    </Grid>
                </div>
                : <Loading/>
        );
    }
}

class Star extends React.Component {
    constructor(props) {
        super(props);

        this.handleHoveringOver = this.handleHoveringOver.bind(this);
    }

    handleHoveringOver(event) {
        this.props.hoverOver(this.props.name);
    }

    render() {
        return this.props.isRated ?
            <span onMouseOver={this.handleHoveringOver} style={{color: 'gold'}}>
                ★
            </span> :
            <span onMouseOver={this.handleHoveringOver} style={{color: 'gold'}}>
                ☆
            </span>;
    }
}

class StarRatingBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            previousRating: 0,
            rating: 0
        };

        this.handleMouseOver = this.handleMouseOver.bind(this);
        this.handleRatingUpdate = this.handleRatingUpdate.bind(this);
        this.handleMouseOut = this.handleMouseOut.bind(this);
    }

    componentDidMount() {
        var api = new Api();
        let promised_api = api.getAPIById(this.props.apiIdProp);
        promised_api.then(
            response => {
            }
        );

        //get user rating
        let promised_rating = api.getRatingFromUser(this.props.apiIdProp, null);
        promised_rating.then(
            response => {
                this.setState({rating: response.obj.userRating});
                this.setState({previousRating: response.obj.userRating});
            }
        );
    }

    handleMouseOver(index) {
        this.setState({rating: index});
    }

    handleMouseOut() {
        this.setState({rating: this.state.previousRating});
    }

    handleRatingUpdate() {
        this.setState({previousRating: this.state.rating});
        this.setState({rating: this.state.rating});

        var api = new Api();
        let ratingInfo = {"rating": this.state.rating};
        let promise = api.addRating(this.props.apiIdProp, ratingInfo);
        promise.then(
            response => {
                message.success("Rating updated successfully");
            }).catch(
            error => {
                message.error("Error occurred while adding ratings!");
            }
        );
    }

    render() {
        return (<div onClick={this.handleRatingUpdate} onMouseOut={this.handleMouseOut}>
            <Star name={1} isRated={this.state.rating >= 1} hoverOver={this.handleMouseOver}> </Star>
            <Star name={2} isRated={this.state.rating >= 2} hoverOver={this.handleMouseOver}> </Star>
            <Star name={3} isRated={this.state.rating >= 3} hoverOver={this.handleMouseOver}> </Star>
            <Star name={4} isRated={this.state.rating >= 4} hoverOver={this.handleMouseOver}> </Star>
            <Star name={5} isRated={this.state.rating >= 5} hoverOver={this.handleMouseOver}> </Star>
        </div>);
    }
}

export default withStyles(styles)(BasicInfo);
