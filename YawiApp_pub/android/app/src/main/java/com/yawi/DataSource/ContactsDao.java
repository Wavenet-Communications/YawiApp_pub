package com.yawi.DataSource;

import com.yawi.model.ContactEntity;

import java.util.List;

import androidx.room.Dao;
import androidx.room.Insert;
import androidx.room.OnConflictStrategy;
import androidx.room.Query;
import androidx.room.Update;

@Dao
public interface ContactsDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    void insert(ContactEntity aContact);

    @Update(onConflict = OnConflictStrategy.REPLACE)
    void update(ContactEntity aContact);

    @Query("DELETE FROM SosContact_table")
    void clearAll();

    @Query("SELECT * from SosContact_table")
    List<ContactEntity> getAllContacts();

}
