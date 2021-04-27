package com.yawi.utils;

import android.content.Context;

import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationServices;

public class LocationProvider {


    public interface LocationProviderCallback {
        void onLocationAvailable(Utils.LatLng aLatLng);
    }
    private final FusedLocationProviderClient mLocationProvider;

    public LocationProvider(Context aContext){
        mLocationProvider = LocationServices.getFusedLocationProviderClient(aContext);
    }

    public void getLastKnownLocation(final LocationProviderCallback aCalback){
        mLocationProvider.getLastLocation().addOnSuccessListener(aLocation -> {
            String lat = ""+ aLocation.getLatitude();
            String longi = "" + aLocation.getLongitude();
            Utils.LatLng lLoc = new Utils.LatLng(lat, longi);
            if (aCalback != null) {
                aCalback.onLocationAvailable(lLoc);
            }
        });
    }

}
