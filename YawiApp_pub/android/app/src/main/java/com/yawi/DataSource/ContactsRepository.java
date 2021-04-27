package com.yawi.DataSource;

import android.content.Context;

import com.yawi.model.ContactEntity;

import java.util.List;

public class ContactsRepository {
    private ContactsDao mContactsDao;

    public ContactsRepository(Context app){
        WaveNetRoomDatabase db = WaveNetRoomDatabase.getInstance(app);
        mContactsDao = db.contactsDao();
    }



    public interface SosContactsCallback {
        void onFetch(List<ContactEntity> aContacts);
    }

    public void  getAllSosContacts(SosContactsCallback aCb){

        WaveNetRoomDatabase.sExecutor.execute(() -> {
            List<ContactEntity> contacts = mContactsDao.getAllContacts();
            if (aCb != null) {
                aCb.onFetch(contacts);
            }
        });

    }

    public void insertContact(ContactEntity aContact){
        WaveNetRoomDatabase.sExecutor.execute(()->{
            mContactsDao.insert(aContact);
        });
    }

    public void insertContacts(List<ContactEntity> aContacts){
        WaveNetRoomDatabase.sExecutor.execute(()->{
            for (ContactEntity contact: aContacts) {
                mContactsDao.insert(contact);
            }
        });
    }
}
