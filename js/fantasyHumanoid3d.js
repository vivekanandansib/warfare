/* Shared, detailed stylized-fantasy humanoid construction for the 3D scenes. */
(function (root) {
  'use strict';
  if (!root.THREE) return;
  const T = root.THREE;
  const mat = (color, metalness, roughness, extra) => new T.MeshStandardMaterial(Object.assign({ color, metalness, roughness }, extra || {}));
  const cache = {};
  const sphere = (w, h, d, seg) => new T.SphereGeometry(1, seg || 16, Math.max(10, (seg || 16) - 2));

  function create(opts) {
    const o = opts || {}, H = o.height || 1.65;
    const g = new T.Group();
    const robe = mat(o.robe == null ? 0x59627a : o.robe, 0.18, 0.78);
    const robeDark = mat(o.shadow || 0x302c3d, 0.25, 0.72);
    const accent = mat(o.accent == null ? 0xc69a50 : o.accent, 0.48, 0.42);
    const gold = mat(o.gold == null ? 0xd1ad62 : o.gold, 0.84, 0.27);
    const skin = mat(o.skin == null ? 0xd5aa83 : o.skin, 0.04, 0.83);
    const hair = mat(o.hair == null ? 0x30252b : o.hair, 0.03, 0.9);
    const steel = mat(o.metal == null ? 0x666f80 : o.metal, 0.82, 0.3);
    const dark = mat(0x211e27, 0.16, 0.86);
    const add = (parent, geo, material, pos, scale, rot) => {
      const m = new T.Mesh(geo, material);
      if (pos) m.position.set(pos[0], pos[1], pos[2]);
      if (scale) m.scale.set(scale[0], scale[1], scale[2]);
      if (rot) m.rotation.set(rot[0], rot[1], rot[2]);
      m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
    };
    const torsoY = H * 0.59, headY = H * 0.88;

    // Layered tunic and shoulder mantle create a readable human silhouette.
    add(g, new T.CylinderGeometry(H * .145, H * .21, H * .49, 12, 1), robe, [0, torsoY, 0]);
    add(g, new T.CylinderGeometry(H * .16, H * .225, H * .12, 12, 1), robeDark, [0, H * .37, 0]);
    add(g, new T.CylinderGeometry(H * .19, H * .16, H * .11, 12, 1), robe, [0, H * .81, 0]);
    // Front panel, belt, buckle and stitched edging.
    add(g, new T.BoxGeometry(H * .095, H * .37, H * .025), accent, [0, H * .58, H * .15]);
    add(g, new T.BoxGeometry(H * .37, H * .055, H * .07), dark, [0, H * .47, H * .01]);
    add(g, new T.BoxGeometry(H * .075, H * .085, H * .035), gold, [0, H * .47, H * .058]);
    for (let s of [-1, 1]) {
      add(g, new T.SphereGeometry(1, 12, 8), accent, [s * H * .17, H * .75, 0], [H * .105, H * .075, H * .12]);
      add(g, new T.BoxGeometry(H * .018, H * .4, H * .018), gold, [s * H * .13, H * .57, H * .153]);
    }
    // Hooded mantle / cape with a folded silhouette.
    if (o.cape !== false) {
      const capeGeo = new T.BufferGeometry();
      const w = H * .24, top = H * .76, bottom = H * .14;
      capeGeo.setAttribute('position', new T.Float32BufferAttribute([-w,top,-.12, w,top,-.12, -w*.82,bottom,-.18, w*.82,bottom,-.18, 0,bottom-H*.025,-.2], 3));
      capeGeo.setIndex([0,2,1,1,2,3,2,4,3]); capeGeo.computeVertexNormals();
      add(g, capeGeo, robeDark);
      add(g, new T.BoxGeometry(H * .035, H * .28, H * .04), accent, [0, H * .59, -.174]);
    }
    // Neck and shaped head, ears, nose, eyes and brows face forward (+Z).
    add(g, new T.CylinderGeometry(H*.048,H*.055,H*.1,10), skin, [0,H*.82,0]);
    add(g, sphere(), skin, [0, headY, 0], [H*.105,H*.135,H*.092]);
    for (let s of [-1,1]) {
      add(g, sphere(1,1,1,12), skin, [s*H*.105,headY,H*.003],[H*.027,H*.048,H*.025]);
      add(g, sphere(1,1,1,12), dark, [s*H*.041,headY+H*.005,H*.087],[H*.012,H*.014,H*.008]);
      add(g, new T.BoxGeometry(H*.035,H*.014,H*.014), hair, [s*H*.041,headY+H*.034,H*.088],[1,1,1],[0,0,s*-.12]);
    }
    add(g, new T.ConeGeometry(H*.025,H*.06,8), skin, [0,headY-H*.012,H*.105],[1,1,1],[Math.PI/2,0,0]);
    if (o.beard) add(g, new T.ConeGeometry(H*.068,H*.12,8), hair, [0,headY-H*.095,H*.025]);
    add(g, sphere(1,1,1,14), hair, [0,headY+H*.088,-H*.006],[H*.115,H*.06,H*.1]);
    if (o.hood) {
      add(g, new T.SphereGeometry(1,14,10), robeDark, [0,headY+H*.035,-H*.025],[H*.145,H*.18,H*.13]);
      add(g, new T.SphereGeometry(1,14,10), robeDark, [0,headY+H*.015,H*.06],[H*.115,H*.115,H*.12]);
    }
    if (o.crown === 'helmet') {
      add(g, new T.SphereGeometry(1,12,8,0,Math.PI*2,0,Math.PI*.52), steel, [0,headY+H*.05,0],[H*.125,H*.12,H*.12]);
      add(g, new T.BoxGeometry(H*.25,H*.028,H*.025), gold, [0,headY,H*.095]);
      add(g, new T.ConeGeometry(H*.035,H*.14,6), accent,[0,headY+H*.16,-H*.015]);
    } else if (o.crown) {
      add(g, new T.CylinderGeometry(H*.12,H*.12,H*.04,16), gold,[0,headY+H*.105,0]);
      for (let i=0;i<5;i++) { const a=i*Math.PI*2/5; add(g,new T.ConeGeometry(H*.025,H*.095,5),gold,[Math.cos(a)*H*.09,headY+H*.17,Math.sin(a)*H*.09]); }
      add(g,new T.OctahedronGeometry(H*.035),accent,[0,headY+H*.13,H*.105]);
    }
    // Articulated limbs include articulated gloves, vambraces and shaped boots.
    const legs=[];
    for (const s of [-1,1]) {
      const leg=new T.Group(); leg.position.set(s*H*.075,H*.31,0); g.add(leg); legs.push(leg);
      add(leg,new T.CylinderGeometry(H*.065,H*.08,H*.31,10),robeDark,[0,-H*.12,0]);
      add(leg,new T.SphereGeometry(1,12,10),steel,[0,-H*.28,H*.025],[H*.082,H*.055,H*.14]);
      add(leg,new T.BoxGeometry(H*.04,H*.025,H*.16),gold,[s*H*.015,-H*.105,H*.069]);
    }
    const arms=[];
    for (const s of [-1,1]) {
      const arm=new T.Group(); arm.position.set(s*H*.205,H*.75,0); g.add(arm); arms.push(arm);
      add(arm,new T.CylinderGeometry(H*.058,H*.05,H*.24,10),o.armColor==null?robe:o.armColor,[s*H*.015,-H*.12,0],[1,1,1],[0,0,-s*.1]);
      add(arm,new T.SphereGeometry(1,12,10),skin,[s*H*.03,-H*.27,H*.015],[H*.055,H*.055,H*.05]);
      add(arm,new T.CylinderGeometry(H*.05,H*.043,H*.13,10),steel,[s*H*.025,-H*.18,H*.012],[1,1,1],[0,0,-s*.1]);
      add(arm,new T.SphereGeometry(1,12,10),accent,[s*H*.014,-H*.045,0],[H*.074,H*.068,H*.09]);
    }
    g.userData.armL=arms[0]; g.userData.armR=arms[1]; g.userData.legL=legs[0]; g.userData.legR=legs[1];
    g.userData.handR=arms[1];
    return g;
  }
  root.FantasyHumanoid3D = { create };
})(window);
