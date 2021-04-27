package com.yawi.di;

import android.content.Context;

import com.yawi.BleManager.MinewApiModule;

import dagger.BindsInstance;
import dagger.Component;

@Component(modules = BleModule.class)
public interface AppComponent {

    @Component.Factory
    interface Factory {
        AppComponent create(@BindsInstance Context aContext);
    }

    void inject(MinewApiModule aApiModule);

}
