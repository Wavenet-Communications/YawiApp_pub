package com.yawi.DataSource;

import android.content.Context;

import com.yawi.model.ContactEntity;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import androidx.room.Database;
import androidx.room.Room;
import androidx.room.RoomDatabase;

@Database(entities = {ContactEntity.class}, version = 1, exportSchema = false)
public abstract class WaveNetRoomDatabase extends RoomDatabase {

    public abstract ContactsDao contactsDao();

    private static volatile WaveNetRoomDatabase INSTANCE;

    private static final int NUM_OF_THREADS = 2;
    private static final String DATABASE_NAME = "Wavenetdatabase";

    static public final ExecutorService sExecutor = Executors.newFixedThreadPool(NUM_OF_THREADS);

    static WaveNetRoomDatabase getInstance(final Context aContext){
        if (INSTANCE == null){
            synchronized (WaveNetRoomDatabase.class) {
                if (INSTANCE == null){
                    INSTANCE = Room.databaseBuilder(aContext, WaveNetRoomDatabase.class, DATABASE_NAME)
                            .build();
                }
            }
        }
        return INSTANCE;
    }
}
