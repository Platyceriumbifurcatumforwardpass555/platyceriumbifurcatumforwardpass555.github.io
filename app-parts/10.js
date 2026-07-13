      // Catalogue additions: TV console carpentry and small decorative objects.
      carpentryCatalog.push(
        {category:'carpentry',name:'TV console',w:1800,d:450,h:500,color:0x8f867d}
      );

      decorativeCatalog.push(
        {category:'decorative',name:'TV',w:1200,d:180,h:760,model:'tv',color:0x2b2b2b},
        {category:'decorative',name:'Framed picture',w:800,d:70,h:1000,model:'picture-frame',color:0x8b6f58},
        {category:'decorative',name:'Bowl of fruits',w:360,d:360,h:190,model:'fruit-bowl',color:0xb8906d},
        {category:'decorative',name:'Handphone',w:80,d:160,h:14,model:'phone',color:0x363636},
        {category:'decorative',name:'Water flask',w:95,d:95,h:300,model:'flask',color:0x9ca5a7}
      );

      function finishDecorativeGroup(group,item){
        const c=worldCenter(item);
        group.position.set(c.x,0,c.z);
        group.rotation.y=THREE.MathUtils.degToRad(item.rotation||0);
        group.userData={...item,furniture:true};
        markObjectChildren(group,item.id);
        return group;
      }

      function createTvObject(item){
        const group=new THREE.Group(),w=mm(item.w),d=mm(item.d),h=mm(item.h);
        const bezel=new THREE.Mesh(
          new THREE.BoxGeometry(w,Math.max(.18,h*.78),Math.max(.025,d*.34)),
          new THREE.MeshStandardMaterial({color:item.color||0x2b2b2b,roughness:.42,metalness:.14})
        );
        bezel.position.y=Math.max(.18,h*.78)/2+Math.max(.06,h*.16);
        group.add(bezel);
        const screen=new THREE.Mesh(
          new THREE.BoxGeometry(w*.92,Math.max(.14,h*.68),Math.max(.008,d*.08)),
          new THREE.MeshStandardMaterial({color:0x101114,roughness:.18,metalness:.2})
        );
        screen.position.set(0,bezel.position.y,Math.max(.018,d*.21));screen.userData.keepMaterialColor=true;group.add(screen);
        const stem=new THREE.Mesh(
          new THREE.BoxGeometry(Math.max(.045,w*.06),Math.max(.05,h*.15),Math.max(.045,d*.22)),
          new THREE.MeshStandardMaterial({color:0x343434,roughness:.55,metalness:.18})
        );
        stem.position.y=Math.max(.025,h*.075);stem.userData.keepMaterialColor=true;group.add(stem);
        const foot=new THREE.Mesh(
          new THREE.BoxGeometry(Math.max(.18,w*.28),Math.max(.018,h*.025),Math.max(.09,d*.75)),
          new THREE.MeshStandardMaterial({color:0x343434,roughness:.55,metalness:.18})
        );
        foot.position.y=Math.max(.009,h*.0125);foot.userData.keepMaterialColor=true;group.add(foot);
        return finishDecorativeGroup(group,item);
      }

      function createPictureFrameObject(item){
        const group=new THREE.Group(),w=mm(item.w),d=mm(item.d),h=mm(item.h);
        const frame=new THREE.Mesh(
          new THREE.BoxGeometry(w,h,Math.max(.025,d)),
          new THREE.MeshStandardMaterial({color:item.color||0x8b6f58,roughness:.78})
        );
        frame.position.y=h/2;group.add(frame);
        const art=new THREE.Mesh(
          new THREE.BoxGeometry(w*.86,h*.84,Math.max(.006,d*.14)),
          new THREE.MeshStandardMaterial({color:0xd8d1c5,roughness:.92})
        );
        art.position.set(0,h/2,Math.max(.016,d*.53));art.userData.keepMaterialColor=true;group.add(art);
        const accent=new THREE.Mesh(
          new THREE.CircleGeometry(Math.max(.05,Math.min(w,h)*.22),24),
          new THREE.MeshBasicMaterial({color:0x7f8c7b,side:THREE.DoubleSide})
        );
        accent.position.set(-w*.1,h*.54,Math.max(.022,d*.63));accent.userData.keepMaterialColor=true;group.add(accent);
        return finishDecorativeGroup(group,item);
      }

      function createFruitBowlObject(item){
        const group=new THREE.Group(),w=mm(item.w),d=mm(item.d),h=mm(item.h),base=Math.min(w,d);
        const bowlH=Math.max(.045,h*.42),bowl=new THREE.Mesh(
          new THREE.CylinderGeometry(base*.46,base*.30,bowlH,24),
          new THREE.MeshStandardMaterial({color:item.color||0xb8906d,roughness:.84})
        );
        bowl.position.y=bowlH/2;group.add(bowl);
        const fruitRadius=Math.max(.025,Math.min(base*.15,h*.22));
        const fruitSpecs=[[-.18,.00,0xd56b45],[.12,-.10,0xd9a53c],[.18,.12,0x8aa04d],[-.06,.16,0xc94f42],[.00,-.20,0xe6b84f]];
        fruitSpecs.forEach(([px,pz,color],i)=>{const fruit=new THREE.Mesh(new THREE.SphereGeometry(fruitRadius*(i===2?.9:1),12,9),new THREE.MeshStandardMaterial({color,roughness:.82}));fruit.position.set(px*base,bowlH+fruitRadius*.68+(i%2)*fruitRadius*.18,pz*base);fruit.userData.keepMaterialColor=true;group.add(fruit);});
        return finishDecorativeGroup(group,item);
      }

      function createPhoneObject(item){
        const group=new THREE.Group(),w=mm(item.w),d=mm(item.d),h=Math.max(.006,mm(item.h));
        const body=new THREE.Mesh(
          new THREE.BoxGeometry(w,h,d),
          new THREE.MeshStandardMaterial({color:item.color||0x363636,roughness:.38,metalness:.18})
        );
        body.position.y=h/2;group.add(body);
        const screen=new THREE.Mesh(
          new THREE.BoxGeometry(w*.86,Math.max(.0015,h*.08),d*.82),
          new THREE.MeshStandardMaterial({color:0x15202a,roughness:.18,metalness:.08})
        );
        screen.position.set(0,h+.001,0);screen.userData.keepMaterialColor=true;group.add(screen);
        const cameraDot=new THREE.Mesh(new THREE.CircleGeometry(Math.max(.002,w*.045),12),new THREE.MeshBasicMaterial({color:0x050505,side:THREE.DoubleSide}));
        cameraDot.rotation.x=-Math.PI/2;cameraDot.position.set(0,h+.002,-d*.36);cameraDot.userData.keepMaterialColor=true;group.add(cameraDot);
        return finishDecorativeGroup(group,item);
      }

      function createFlaskObject(item){
        const group=new THREE.Group(),w=mm(item.w),d=mm(item.d),h=mm(item.h),radius=Math.max(.025,Math.min(w,d)*.44);
        const bodyH=Math.max(.08,h*.86),body=new THREE.Mesh(
          new THREE.CylinderGeometry(radius*.88,radius,bodyH,20),
          new THREE.MeshStandardMaterial({color:item.color||0x9ca5a7,roughness:.52,metalness:.2})
        );
        body.position.y=bodyH/2;group.add(body);
        const neck=new THREE.Mesh(new THREE.CylinderGeometry(radius*.58,radius*.68,Math.max(.025,h*.08),16),new THREE.MeshStandardMaterial({color:0x676e70,roughness:.5,metalness:.22}));
        neck.position.y=bodyH+Math.max(.0125,h*.04);neck.userData.keepMaterialColor=true;group.add(neck);
        const cap=new THREE.Mesh(new THREE.CylinderGeometry(radius*.62,radius*.62,Math.max(.018,h*.06),16),new THREE.MeshStandardMaterial({color:0x3f4445,roughness:.58,metalness:.12}));
        cap.position.y=bodyH+Math.max(.025,h*.08)+Math.max(.009,h*.03);cap.userData.keepMaterialColor=true;group.add(cap);
        return finishDecorativeGroup(group,item);
      }

      // This declaration intentionally supersedes the earlier generic renderer.
      function createFurnitureMesh(item){
        let object;
        if(item.model==='plant')object=createPlantObject(item);
        else if(item.model==='glass-blocks'){
          const texture=glassBlockTexture(item),mat=new THREE.MeshStandardMaterial({color:item.color||palette.glass,map:texture,transparent:true,opacity:.62,roughness:.18,metalness:.02,side:THREE.DoubleSide});
          object=makeBox(item,mat);object.userData={...item,furniture:true};markObjectChildren(object,item.id);
        }
        else if(item.model==='tv')object=createTvObject(item);
        else if(item.model==='picture-frame')object=createPictureFrameObject(item);
        else if(item.model==='fruit-bowl')object=createFruitBowlObject(item);
        else if(item.model==='phone')object=createPhoneObject(item);
        else if(item.model==='flask')object=createFlaskObject(item);
        else{
          const roughness=item.category==='carpentry'?.86:.78,mat=new THREE.MeshStandardMaterial({color:item.color||palette.furniture,roughness,metalness:.02});
          object=makeBox(item,mat);object.userData={...item,furniture:true};markObjectChildren(object,item.id);
        }
        furnitureGroup.add(object);return object;
      }
