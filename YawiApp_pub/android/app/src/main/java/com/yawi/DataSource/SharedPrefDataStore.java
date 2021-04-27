package com.yawi.DataSource;

import android.content.Context;
import android.content.SharedPreferences;

import javax.inject.Inject;

import static android.content.Context.MODE_PRIVATE;

public class SharedPrefDataStore {

    private final Context mContext;

    public static final String PREF_NAME = "devicesdk";

    @Inject
    public SharedPrefDataStore(Context aContext) {
        mContext = aContext;
    }

    public void store(String aTag, String aData) {

        SharedPreferences mSharedPreferences = mContext.getSharedPreferences(PREF_NAME, MODE_PRIVATE);
        SharedPreferences.Editor editor = mSharedPreferences.edit();
        editor.putString(aTag, aData);
        editor.commit();
    }
    public void store(String aTag, boolean aflag) {

        SharedPreferences mSharedPreferences = mContext.getSharedPreferences(PREF_NAME, MODE_PRIVATE);
        SharedPreferences.Editor editor = mSharedPreferences.edit();
        editor.putBoolean(aTag, aflag);
        editor.commit();
    }

    public String retrieveString(String aTag){
        SharedPreferences mSharedPreferences = mContext.getSharedPreferences(PREF_NAME, MODE_PRIVATE);
        String data = mSharedPreferences.getString(aTag, "");
        return data;
    }
    public boolean retrieveBoolean(String aTag){
        SharedPreferences mSharedPreferences = mContext.getSharedPreferences(PREF_NAME, MODE_PRIVATE);
        boolean data = mSharedPreferences.getBoolean(aTag, false);
        return data;
    }

}
