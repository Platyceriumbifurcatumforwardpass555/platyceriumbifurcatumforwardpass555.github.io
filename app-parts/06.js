      }

      function pushHistory(label){ undoStack.push(JSON.stringify(project)); if(undoStack.length>60)undoStack.shift(); redoStack.length=0; $('undo').disabled=false; $('redo').disabled=true; $('undo').title=`Undo ${label||'action'}`; }
      function restoreSnapshot(json){ project=JSON.parse(json); normalizeProject(); selected=null; selectedArchitecture=null; transform.detach(); wallDetectionCache=null; basemapRenderSignature=''; if(project.basemap?.dataUrl){basemapImage=new Image();basemapImage.src=project.basemap.dataUrl;} buildScene(); syncBasemapControls(); }
      function undoAction(){ if(!undoStack.length)return; redoStack.push(JSON.stringify(project)); restoreSnapshot(undoStack.pop()); $('undo').disabled=!undoStack.length; $('redo').disabled=false; }
      function redoAction(){ if(!redoStack.length)return; undoStack.push(JSON.stringify(project)); restoreSnapshot(redoStack.pop()); $('undo').disabled=false; $('redo').disabled=!redoStack.length; }

      function architectureRow(item){
        const row=document.createElement('div');row.className='object-row'+(selectedArchitecture?.id===item.id?' selected':'');
        const b=document.createElement('button');b.textContent=`${item._kind==='wall'?'▰':item.type==='door'?'◰':'▭'} ${item.name}`;b.onclick=()=>selectArchitecture(item._kind,item.id);
        const del=document.createElement('button');del.className='eye danger';del.textContent='×';del.title='Delete';del.onclick=e=>{e.stopPropagation();deleteArchitecture(item._kind,item.id);};row.append(b,del);return row;
      }
      function appendArchitectureSubgroup(parent,title,items,open=false){
        const details=document.createElement('details');details.className='subgroup';details.open=open;
        const summary=document.createElement('summary');summary.innerHTML=`<span>${title}</span><span>${items.length}</span>`;details.appendChild(summary);
        const body=document.createElement('div');body.className='objects';items.forEach(item=>body.appendChild(architectureRow(item)));details.appendChild(body);parent.appendChild(details);
      }
      function renderArchitectureList(){
        const walls=(project.walls||[]).map(x=>({...x,_kind:'wall'})),openings=(project.openings||[]).map(x=>({...x,_kind:'opening'})),all=[...walls,...openings];
        $('architectureCount').textContent=`${all.length} items`;$('architectureRoomCount').textContent=`${(project.rooms||[]).length} rooms`;
        const typeEl=$('architectureList');typeEl.innerHTML='';
        appendArchitectureSubgroup(typeEl,'Walls',walls,true);
        appendArchitectureSubgroup(typeEl,'Doors',openings.filter(x=>x.type==='door'));
        appendArchitectureSubgroup(typeEl,'Windows',openings.filter(x=>x.type==='window'));
        const roomEl=$('architectureRoomList');roomEl.innerHTML='';const grouped=new Map();
        all.forEach(item=>{const room=roomForArchitecture(item,item._kind);if(!grouped.has(room))grouped.set(room,[]);grouped.get(room).push(item);});
        const order=[...(project.rooms||[]).map(r=>r.name),'Unassigned'];
        [...grouped.keys()].sort((a,b)=>{const ai=order.indexOf(a),bi=order.indexOf(b);return (ai<0?999:ai)-(bi<0?999:bi)||a.localeCompare(b);}).forEach((room,i)=>appendArchitectureSubgroup(roomEl,room,grouped.get(room),i===0));
      }
      function populateArchitectureFields(kind,item){
        $('architectureEmpty').hidden=true;$('architectureFields').hidden=false;$('archName').value=item.name;
        const isWall=kind==='wall';$('archThickness').disabled=!isWall;$('openingWidth').disabled=isWall;$('openingOffset').disabled=isWall;
        document.querySelectorAll('.wall-coordinate').forEach(x=>x.hidden=!isWall);$('selectedWallNote').hidden=!isWall;
        $('alignSelectedWall').disabled=!isWall||!project.basemap;$('alignAllWalls').disabled=!project.basemap;
        if(isWall){
          const e=wallMetrics(item);$('archThickness').value=Math.round(e.thickness);$('archHeight').value=Math.round(item.h);$('archX1').value=Math.round(e.x1);$('archY1').value=Math.round(e.y1);$('archX2').value=Math.round(e.x2);$('archY2').value=Math.round(e.y2);$('archLength').value=Math.round(e.length);$('archRotation').value=Math.round(THREE.MathUtils.radToDeg(e.angle)*10)/10;$('openingWidth').value='';$('openingOffset').value='';
        }else{
          $('archThickness').value='';$('archHeight').value=Math.round(item.height);$('archLength').value='';$('archRotation').value='';$('openingWidth').value=Math.round(item.width);$('openingOffset').value=Math.round(item.offset);
        }
      }
      function selectArchitecture(kind,id){
        const list=kind==='wall'?project.walls:project.openings,item=list.find(x=>x.id===id);if(!item)return;
        select(null);selectedArchitecture={kind,id};setTool('select');populateArchitectureFields(kind,item);renderArchitectureList();renderArchitectureHighlight();$('selectionStatus').textContent=item.name;
      }
      function updateArchitecturePanel(){
        const item=selectedArchitectureItem();
        if(!item){selectedArchitecture=null;$('architectureEmpty').hidden=false;$('architectureFields').hidden=true;clearGroup(selectionOverlayGroup);return;}
        populateArchitectureFields(selectedArchitecture.kind,item);
      }
      function rebuildArchitecture(){
        const item=selectedArchitectureItem();if(!item)return;pushHistory('architecture edit');item.name=$('archName').value;
        if(selectedArchitecture.kind==='wall'){
          item.h=Math.max(500,+$('archHeight').value||item.h);const t=Math.max(50,+$('archThickness').value||wallThickness(item));
          let x1=+$('archX1').value,y1=+$('archY1').value,x2=+$('archX2').value,y2=+$('archY2').value;
          const current=wallMetrics(item),requestedLength=Math.max(200,+$('archLength').value||Math.hypot(x2-x1,y2-y1)),requestedAngle=THREE.MathUtils.degToRad(+$('archRotation').value||0);
          const endpointLength=Math.hypot(x2-x1,y2-y1),fieldsChanged=Math.abs(endpointLength-current.length)>1||Math.abs(x1-current.x1)>1||Math.abs(y1-current.y1)>1||Math.abs(x2-current.x2)>1||Math.abs(y2-current.y2)>1;
          if(!fieldsChanged){const cx=current.cx,cy=current.cy;x1=cx-Math.cos(requestedAngle)*requestedLength/2;y1=cy-Math.sin(requestedAngle)*requestedLength/2;x2=cx+Math.cos(requestedAngle)*requestedLength/2;y2=cy+Math.sin(requestedAngle)*requestedLength/2;}
          setWallFromEndpoints(item,x1,y1,x2,y2,t);
        }else{
          const wall=(project.walls||[]).find(w=>w.id===item.wallId),length=wall?wallMetrics(wall).length:Infinity;
          item.width=Math.max(300,+$('openingWidth').value||item.width);item.offset=Math.max(item.width/2,Math.min(length-item.width/2,+$('openingOffset').value||item.offset));item.height=Math.max(300,+$('archHeight').value||item.height);
        }
        buildScene();
      }
      function deleteArchitecture(kind,id){
        pushHistory('delete architecture');if(kind==='wall'){project.walls=project.walls.filter(x=>x.id!==id);project.openings=project.openings.filter(x=>x.wallId!==id);}else project.openings=project.openings.filter(x=>x.id!==id);
        if(selectedArchitecture?.id===id)selectedArchitecture=null;buildScene();
      }

      function setTool(tool){activeTool=tool;wallStart=null;['select','wall','door','window'].forEach(t=>$('tool'+t[0].toUpperCase()+t.slice(1)).classList.toggle('active',t===tool));const hints={select:'Select furniture or architecture. Selected walls have draggable move, endpoint and rotation handles.',wall:'Click two points in top view to draw a wall at any angle.',door:'Click an existing wall to insert a door.',window:'Click an existing wall to insert a window.'};$('toolHint').textContent=hints[tool];if(tool!=='select')viewTop();}
      function planPoint(event,snap=50){const r=renderer.domElement.getBoundingClientRect();pointer.x=((event.clientX-r.left)/r.width)*2-1;pointer.y=-((event.clientY-r.top)/r.height)*2+1;raycaster.setFromCamera(pointer,camera);const p=new THREE.Vector3();if(!raycaster.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),0),p))return null;return{x:Math.round(p.x/MM/snap)*snap,y:Math.round(p.z/MM/snap)*snap};}
      function drawWallAt(point){
        if(!wallStart){wallStart=point;$('toolHint').textContent='Choose the wall end point.';return;}
        const length=Math.hypot(point.x-wallStart.x,point.y-wallStart.y);if(length<200){$('toolHint').textContent='Wall must be at least 200 mm long.';return;}
        pushHistory('draw wall');const wall={id:'wall-'+Date.now(),name:'New wall',h:Math.max(500,+$('wallHeight').value)};setWallFromEndpoints(wall,wallStart.x,wallStart.y,point.x,point.y,Math.max(50,+$('wallThickness').value));project.walls.push(wall);wallStart=null;buildScene();selectArchitecture('wall',wall.id);$('toolHint').textContent='Wall added. Drag its blue endpoints or green rotation handle to refine it.';
      }
      function nearestWall(point){
        let best=null,bestDistance=Infinity;(project.walls||[]).forEach(w=>{const e=wallMetrics(w),vx=point.x-e.x1,vy=point.y-e.y1,offset=Math.max(0,Math.min(e.length,vx*e.ux+vy*e.uy)),cx=e.x1+e.ux*offset,cy=e.y1+e.uy*offset,distance=Math.hypot(point.x-cx,point.y-cy);if(distance<bestDistance){best={wall:w,distance,offset};bestDistance=distance;}});return bestDistance<=500?best:null;
      }
      function addOpeningAt(point,type){const hit=nearestWall(point);if(!hit){$('toolHint').textContent='No wall found nearby. Click closer to a wall.';return;}const width=type==='door'?+$('doorWidth').value:+$('windowWidth').value,length=wallMetrics(hit.wall).length,offset=Math.max(width/2+50,Math.min(length-width/2-50,hit.offset));pushHistory(`add ${type}`);project.openings.push({id:type+'-'+Date.now(),name:type==='door'?'New door':'New window',type,wallId:hit.wall.id,offset,width,height:type==='door'?2100:1200,sill:type==='door'?0:900,swing:'left'});buildScene();}

      function syncBasemapControls(){
        const b=project.basemap;
        if(!b){const width=project.plan?.width||PLAN_W,depth=project.plan?.depth||PLAN_H;$('planWidth').value=Math.round(width);$('planDepth').value=Math.round(depth);$('basemapOffsetX').value=0;$('basemapOffsetY').value=0;$('alignAllWalls').disabled=true;$('alignSelectedWall').disabled=true;basemapAspectRatio=width/depth;return;}
        $('planWidth').value=Math.round(b.width||PLAN_W);$('planDepth').value=Math.round(b.depth||PLAN_H);$('basemapOffsetX').value=Math.round(b.offsetX||0);$('basemapOffsetY').value=Math.round(b.offsetY||0);$('basemapOpacity').value=Math.round((b.opacity??.48)*100);$('lockBasemapRatio').checked=b.lockRatio!==false;
        basemapAspectRatio=(b.width||PLAN_W)/(b.depth||PLAN_H);$('alignAllWalls').disabled=false;
      }
      function loadBasemap(file){
        const reader=new FileReader();reader.onload=()=>{const image=new Image();image.onload=()=>{pushHistory('upload basemap');basemapImage=image;const width=+$('planWidth').value||PLAN_W,depth=+$('planDepth').value||PLAN_H;basemapAspectRatio=width/depth;project.basemap={dataUrl:reader.result,sourceName:file.name||'basemap.png',mimeType:file.type||'image/png',width,depth,offsetX:+$('basemapOffsetX').value||0,offsetY:+$('basemapOffsetY').value||0,opacity:+$('basemapOpacity').value/100,sourceWidth:image.width,sourceHeight:image.height,crop:{left:0,top:0,right:1,bottom:1},lockRatio:$('lockBasemapRatio').checked};$('ocrPanel').hidden=true;wallDetectionCache=null;basemapRenderSignature='';buildBasemap(true);syncBasemapControls();$('basemapStatus').textContent='Basemap uploaded. Enter the printed overall dimensions, then use Auto-fit drawing β before tracing or aligning walls.';renderArchitectureHighlight();updateProjectWorkspace();};image.src=reader.result;};reader.readAsDataURL(file);
      }
      function collectLineBands(mask,w,h,horizontal){
        const records=[],primary=horizontal?h:w,secondary=horizontal?w:h,minRun=Math.max(14,Math.round(secondary*.035));
        for(let p=1;p<primary-1;p++){
          let start=-1,last=-1,gap=0;
          for(let q=1;q<secondary-1;q++){
            const idx=horizontal?p*w+q:q*w+p;
            const thick=horizontal?(mask[idx]&&mask[idx-w]&&mask[idx+w]):(mask[idx]&&mask[idx-1]&&mask[idx+1]);
            if(thick){if(start<0)start=q;last=q;gap=0;}else if(start>=0){gap++;if(gap>2){if(last-start+1>=minRun)records.push({p,a:start,b:last});start=-1;last=-1;gap=0;}}
          }
          if(start>=0&&last-start+1>=minRun)records.push({p,a:start,b:last});
        }
        const bands=[];
        for(const rec of records){
          let best=null,bestOverlap=0;
          for(const band of bands){
            if(rec.p-band.lastP>2)continue;const overlap=Math.max(0,Math.min(rec.b,band.lastB)-Math.max(rec.a,band.lastA));const ratio=overlap/Math.max(1,Math.min(rec.b-rec.a,band.lastB-band.lastA));if(ratio>.48&&ratio>bestOverlap){best=band;bestOverlap=ratio;}
          }
          if(best){best.lastP=rec.p;best.lastA=rec.a;best.lastB=rec.b;best.ps.push(rec.p);best.as.push(rec.a);best.bs.push(rec.b);}else bands.push({lastP:rec.p,lastA:rec.a,lastB:rec.b,ps:[rec.p],as:[rec.a],bs:[rec.b]});
        }
        const median=a=>{const x=[...a].sort((m,n)=>m-n);return x[(x.length/2)|0];};
        return bands.map(b=>({p0:Math.min(...b.ps),p1:Math.max(...b.ps),p:median(b.ps),a:median(b.as),b:median(b.bs)})).filter(b=>{
