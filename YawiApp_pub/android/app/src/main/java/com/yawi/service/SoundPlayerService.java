package com.yawi.service;

import android.content.Context;
import android.content.Intent;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.util.Log;


import com.yawi.R;

import androidx.annotation.NonNull;
import androidx.core.app.JobIntentService;

public class SoundPlayerService extends JobIntentService {

    static final int JOB_ID = 9980;
    private static final String TAG = "SoundPlayerService";
    private static MediaPlayer mSoundPlayer;

    static public void enqueueWork(Context context, Intent work){
        enqueueWork(context, SoundPlayerService.class, JOB_ID, work);
    }
    @Override
    protected void onHandleWork(@NonNull Intent intent) {
        Log.d(TAG, "onHandleWork: ");
        playSound(0);
    }

    private boolean initializePlayer() {
        try{
            mSoundPlayer = MediaPlayer.create(SoundPlayerService.this, R.raw.alarmsound);
            mSoundPlayer.setOnCompletionListener(mp -> {
                releasePlayer();
            });
        }catch (Exception e){
            Log.e(TAG, "initializeSoundPool: " + e.getMessage());
            return false;
        }
        return true;
    }

    private void playSound(final int loop) {
        if (mSoundPlayer != null) {
            if (mSoundPlayer.isPlaying()){
                stopPlay();
            }else{
                startPlay();
            }
        } else {
            if (initializePlayer())
              startPlay();
        }
    }

    private void stopPlay(){
        releasePlayer();
    }

    private void startPlay(){
        AudioManager mgr = (AudioManager) SoundPlayerService.this.getSystemService(Context.AUDIO_SERVICE);
        float streamVolumeCurrent = mgr.getStreamVolume(AudioManager.STREAM_MUSIC);
        float streamVolumeMax = mgr.getStreamMaxVolume(AudioManager.STREAM_MUSIC);
        float volume = streamVolumeCurrent / streamVolumeMax;
        mSoundPlayer.setVolume(volume, volume);
        mSoundPlayer.start();
    }

    private void releasePlayer(){
        if (mSoundPlayer != null){
            mSoundPlayer.stop();
            mSoundPlayer.release();
            mSoundPlayer = null;
        }
    }
    @Override
    public void onDestroy() {
        super.onDestroy();
    }
}
