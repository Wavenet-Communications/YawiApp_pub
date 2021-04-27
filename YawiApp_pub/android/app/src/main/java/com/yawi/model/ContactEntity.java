package com.yawi.model;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.annotations.Expose;
import com.google.gson.reflect.TypeToken;

import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.List;

import androidx.annotation.NonNull;
import androidx.room.ColumnInfo;
import androidx.room.Entity;
import androidx.room.PrimaryKey;

@Entity(tableName = "SosContact_table")
public class ContactEntity {

    @PrimaryKey
    @NonNull
    @ColumnInfo(name = "Number")
    @Expose
    private String mNumber;
    @ColumnInfo(name = "Name")
    @Expose
    private String mName;
    @ColumnInfo(name = "Relation")
    @Expose
    private int    mRelation;

    public ContactEntity(String mName, String mNumber, int mRelation) {
        this.mName = mName;
        this.mNumber = mNumber;
        this.mRelation = mRelation;
    }

    public String getName() {
        return mName;
    }

    public String getNumber() {
        return mNumber;
    }

    public int getRelation() {
        return mRelation;
    }

    static public String toJsonString(List<ContactEntity> aContacts) {
        Gson lGson = new GsonBuilder().excludeFieldsWithModifiers().create();
        String lContactStr = lGson.toJson(aContacts);

        return lContactStr;
    }

    static public List<ContactEntity> fromJsonString(String aStr){
        Gson gson = (new GsonBuilder()).excludeFieldsWithoutExposeAnnotation()
                .create();
        Type lType = (new TypeToken<List<ContactEntity>>() {
        }).getType();
        ArrayList lDevices = gson.fromJson(aStr, lType);

        return lDevices;
    }
}
