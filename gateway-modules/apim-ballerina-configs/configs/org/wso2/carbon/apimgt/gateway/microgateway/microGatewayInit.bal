package org.wso2.carbon.apimgt.gateway.microgateway;

import ballerina.lang.system;
import ballerina.lang.errors;
import org.wso2.carbon.apimgt.gateway.holders as holder;
import ballerina.net.http;

service<http> gatewayInitService {

    boolean isCacheInitialized = holder:initializeCache();
    boolean isMapsAdded = holder:addThrottleMaps();
    boolean isReady = initGateway();

    boolean subscriptionsInitialized = retrieveOfflineSubscriptions();
}

function initGateway () (boolean) {
    system:println("initGateway() in microGatewayInit.bal");
    try {
        loadConfigs();
        loadOfflineAPIs();
        return true;
    } catch (errors:Error e) {
        system:println("Error while initilazing API gateway. " + e.msg);
        return false;
    }
    return true;
    //otherwise, missing return statement
}