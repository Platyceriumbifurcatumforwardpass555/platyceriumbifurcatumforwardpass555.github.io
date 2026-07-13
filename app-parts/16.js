      // Ensure wall and camera world matrices are current before cutaway raycasting,
      // including the first frame after a project or scene rebuild.
      const automaticBlockingWallIdsBeforeMatrixRefresh=automaticBlockingWallIds;
      automaticBlockingWallIds=function(settings){
        scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
        return automaticBlockingWallIdsBeforeMatrixRefresh(settings);
      };

      // "Show all walls" is an absolute reset: clear manual overrides and turn off
      // automatic cutaway so the complete architectural shell is visible again.
      const syncCameraCutawayControlsBeforeShowAll=syncCameraCutawayControls;
      syncCameraCutawayControls=function(){
        syncCameraCutawayControlsBeforeShowAll();
        const settings=ensureCameraCutawaySettings();
        if($('showAllCameraWalls'))$('showAllCameraWalls').disabled=!settings.enabled&&!settings.hiddenWallIds.length;
      };
      if($('showAllCameraWalls'))$('showAllCameraWalls').onclick=()=>updateCutawaySetting('show all camera walls',settings=>{settings.enabled=false;settings.hiddenWallIds=[];});
