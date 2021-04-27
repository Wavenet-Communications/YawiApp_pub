package com.yawi.model;

class WaveDeviceEntity {
    String mac;
    String name;

    String devImage;
    int rssi;
    int mode;
    float distance;
    int battery;
    boolean bindState;
    String disappearTime;
    float disappearLong;
    float disappearLat;
    boolean connectionState;
    boolean devLoseAlert;
    boolean searchDev;
    boolean appAlert;
    boolean featureSupport;
    int alarmDist;
    int alaramDelay;
    String findStatus;
    boolean sosModeState;

    public WaveDeviceEntity() {
    }

    public String getMac() {
        return mac;
    }

    public void setMac(String aMac) {
        mac = aMac;
    }

    public String getName() {
        return name;
    }

    public void setName(String aName) {
        name = aName;
    }

    public int getRssi() {
        return rssi;
    }

    public void setRssi(int aRssi) {
        rssi = aRssi;
    }

    public int getMode() {
        return mode;
    }

    public void setMode(int aMode) {
        mode = aMode;
    }

    public float getDistance() {
        return distance;
    }

    public void setDistance(float aDistance) {
        distance = aDistance;
    }

    public int getBattery() {
        return battery;
    }

    public void setBattery(int aBattery) {
        battery = aBattery;
    }

    public boolean isBindState() {
        return bindState;
    }

    public void setBindState(boolean aBindState) {
        bindState = aBindState;
    }

    public String getDisappearTime() {
        return disappearTime;
    }

    public void setDisappearTime(String aDisappearTime) {
        disappearTime = aDisappearTime;
    }

    public String getDevImage() {
        return devImage;
    }

    public void setDevImage(String aDevImage) {
        devImage = aDevImage;
    }


    public float getDisappearLong() {
        return disappearLong;
    }

    public void setDisappearLong(float aDisappearLong) {
        disappearLong = aDisappearLong;
    }

    public float getDisappearLat() {
        return disappearLat;
    }

    public void setDisappearLat(float aDisappearLat) {
        disappearLat = aDisappearLat;
    }

    public boolean isConnectionState() {
        return connectionState;
    }

    public void setConnectionState(boolean aConnectionState) {
        connectionState = aConnectionState;
    }

    public boolean isDevLoseAlert() {
        return devLoseAlert;
    }

    public void setDevLoseAlert(boolean aDevLoseAlert) {
        devLoseAlert = aDevLoseAlert;
    }

    public boolean isSearchDev() {
        return searchDev;
    }

    public void setSearchDev(boolean aSearchDev) {
        searchDev = aSearchDev;
    }

    public boolean isAppAlert() {
        return appAlert;
    }

    public void setAppAlert(boolean aAppAlert) {
        appAlert = aAppAlert;
    }

    public boolean isFeatureSupport() {
        return featureSupport;
    }

    public void setFeatureSupport(boolean aFeatureSupport) {
        featureSupport = aFeatureSupport;
    }

    public int getAlarmDist() {
        return alarmDist;
    }

    public void setAlarmDist(int aAlarmDist) {
        alarmDist = aAlarmDist;
    }

    public int getAlaramDelay() {
        return alaramDelay;
    }

    public void setAlaramDelay(int aAlaramDelay) {
        alaramDelay = aAlaramDelay;
    }

    public String getFindStatus() {
        return findStatus;
    }

    public void setFindStatus(String aFindStatus) {
        findStatus = aFindStatus;
    }


};

