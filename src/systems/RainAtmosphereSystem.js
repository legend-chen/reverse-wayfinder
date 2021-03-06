import * as Tags from "../tags";
import * as THREE from "three";
import * as MathUtil from "../util/math";
import * as eases from "eases";
import ObjectPool from "../util/ObjectPool";
import Random from "../util/Random";
import Line3D from "./writing/Line3D";
import getPathFromSVG from "../util/getPathFromSVG";
import CapsuleBufferGeometry from "../util/CapsuleBufferGeometry";
import { detachObject } from "../util/three-util";

export default function RainAtmosphereSystem(world) {
  const random = Random();

  const group = new THREE.Group();
  group.name = "rainparticles";
  const rainGroup = new THREE.Group();
  const splatterGroup = new THREE.Group();
  group.add(rainGroup);
  group.add(splatterGroup);
  world.entity().add(Tags.Object3D, group);

  const radius = 0.02;
  const baseLength = 0.25;
  const dummyGeometry = new THREE.BufferGeometry();
  const geometries = [baseLength, baseLength * 2].map((length) => {
    const geometry = new CapsuleBufferGeometry(
      radius,
      radius,
      length,
      5,
      1,
      2,
      2
    );
    geometry.userData.length = length;
    geometry.translate(0, -length / 2, 0);
    return geometry;
  });

  const white = new THREE.Color(1, 1, 1);
  const colors = MathUtil.linspace(10).map((t) => {
    const color = new THREE.Color("#7dcdf2").offsetHSL(
      random.range(-1, 1) * (5 / 360),
      random.range(-1, 1) * (10 / 100),
      random.range(-1, 1) * (10 / 100)
    );
    return color;
  });

  const pool = new ObjectPool({
    maxCapacity: 50,
    initialCapacity: 50,
    create() {
      const mesh = new THREE.Mesh(
        dummyGeometry,
        new THREE.MeshBasicMaterial({
          name: "rain",
          // transparent: true,
          // opacity: 0.5,
        })
      );
      mesh.matrixAutoUpdate = false;
      mesh.userData._entity = null;
      mesh.frustumCulled = false;
      mesh.visible = false;
      return mesh;
    },
    release(m) {},
  });

  // const splatterGeometry = new THREE.CircleGeometry(radius * 4, 12);
  const splatRadius = 0.03;
  const thick = splatRadius * 3;
  const splatterGeometry = new THREE.RingGeometry(
    splatRadius * 4,
    splatRadius * 4 + thick,
    12,
    1
  );
  splatterGeometry.rotateX(-Math.PI / 2);
  const splatterPool = new ObjectPool({
    maxCapacity: 50,
    initialCapacity: 50,
    create() {
      const mesh = new THREE.Mesh(
        splatterGeometry,
        new THREE.MeshBasicMaterial({
          name: "splatter",
          transparent: true,
          opacity: 0.5,
          // depthTest: false,
          // depthWrite: false,
          // blending: THREE.MultiplyBlending,
        })
      );
      mesh.renderOrder = 5;
      mesh.matrixAutoUpdate = false;
      mesh.userData._entity = null;
      mesh.frustumCulled = false;
      mesh.visible = false;
      return mesh;
    },
  });

  // const velocity = new THREE.Vector3(-0.0, -1.0, 0.0).normalize();
  const velocity = new THREE.Vector3(0.5, -1.0, 0.0).normalize();
  const tmpArr2D = [0, 0];
  const tmpVec3 = new THREE.Vector3();

  const hitPlane = new THREE.Plane(new THREE.Vector3(-0, -1, -0), -0);
  const ray = new THREE.Ray();
  const rayHitTarget = new THREE.Vector3();
  ray.direction.copy(velocity);

  const drops = world.view([Tags.RainDrop, Tags.Object3D]);
  const splatters = world.view([Tags.RainDropSplatter, Tags.Object3D]);

  const rainSize = 1;
  const newSpawnDelay = () => random.range(0.075, 0.2);
  let spawnTimer = 0;
  let spawnDelay = newSpawnDelay();
  const target = world.findTag(Tags.UserTarget);
  const activeEnv = world.view(Tags.ActiveEnvironmentState);
  const underPlayer = world.findTag(Tags.EnvironmentUnderPlayerState);
  const rainEntity = world.entity();
  let lastLake = null;

  let rainTime = 0;
  const newRainDuration = () => random.range(5, 10);
  let rainDuration = newRainDuration();
  let clearLake = false;

  return function processRain(dt) {
    const env = activeEnv.length
      ? activeEnv[0].get(Tags.EnvironmentState).name
      : null;

    // if (!world.findTag(Tags.GameStarted)) return;

    let canSpawn = env && env === "grasslands";

    if (canSpawn && underPlayer.water && underPlayer.lake) {
      if (!rainEntity.has(Tags.Raining)) {
        if (lastLake == null) {
          // no last lake, wait for next
          lastLake = underPlayer.lake;
        } else {
          // got a new lake, trigger & reset
          if (underPlayer.lake !== lastLake) {
            rainEntity.tagOn(Tags.Raining);
            rainDuration = newRainDuration();
            clearLake = true;
            rainTime = 0;
            lastLake = null;
          }
        }
      }
    }

    if (!underPlayer.water && clearLake) {
      clearLake = false;
      lastLake = null;
    }

    if (canSpawn && rainEntity.has(Tags.Raining)) {
      rainTime += dt;
      if (rainTime >= rainDuration) {
        rainEntity.tagOff(Tags.Raining);
      }
    }

    if (canSpawn && rainEntity.has(Tags.Raining)) {
      spawnTimer += dt;
      if (spawnTimer >= spawnDelay) {
        spawnTimer %= spawnDelay;
        spawnDelay = newSpawnDelay();
        const count = random.rangeFloor(1, 6);
        for (let i = 0; i < count; i++) {
          if (!spawn(target.position)) break;
        }
      }
    }

    for (let i = 0; i < drops.length; i++) {
      const e = drops[i];
      const drop = e.get(Tags.RainDrop);
      const mesh = e.get(Tags.Object3D);
      mesh.position.addScaledVector(velocity, dt * drop.speed);
      mesh.visible = true;

      drop.time += dt;

      let anim = 0;
      if (drop.time <= drop.animateDuration) {
        anim = drop.time / drop.animateDuration;
      } else {
        anim = 1;
      }

      mesh.scale.setScalar(anim * rainSize);

      mesh.updateMatrix();
      // mesh.updateMatrixWorld();

      tmpVec3.set(0, 0, 0);
      tmpVec3.applyMatrix4(mesh.matrixWorld);

      if (tmpVec3.y <= 0 && !drop.splat) {
        drop.splat = true;

        splatter(drop.splatterSpawnPosition, mesh.material.color);
      }

      if (tmpVec3.y <= -(mesh.geometry.userData.length * rainSize)) {
        pool.release(mesh);
        mesh.userData._entity = null;
        mesh.visible = false;
        detachObject(mesh);
        e.remove(Tags.RainDrop);
      }
    }

    for (let i = 0; i < splatters.length; i++) {
      const e = splatters[i];
      const splatter = e.get(Tags.RainDropSplatter);
      const mesh = e.get(Tags.Object3D);
      mesh.visible = true;

      splatter.time += dt;

      let anim = 0;
      if (splatter.time <= splatter.animateDuration) {
        anim = splatter.time / splatter.animateDuration;
      } else if (
        splatter.time >=
        splatter.duration - splatter.animateDuration
      ) {
        const el = Math.max(
          0,
          splatter.time - (splatter.duration - splatter.animateDuration)
        );
        const t = el / splatter.animateDuration;
        anim = 1 - t;
      } else {
        anim = 1;
      }

      anim = eases.sineInOut(anim);

      mesh.scale.setScalar(anim * rainSize);

      if (splatter.time >= splatter.duration) {
        splatterPool.release(mesh);
        mesh.userData._entity = null;
        mesh.visible = false;
        detachObject(mesh);
        e.kill();
      } else {
        mesh.updateMatrix();
      }
    }
  };

  function splatter(position, color) {
    const mesh = splatterPool.next();
    if (!mesh) return false;

    splatterGroup.add(mesh);
    mesh.material.color.copy(color);
    //.lerp(white, 0.5);
    mesh.position.copy(position);
    mesh.position.y = 0.1;
    mesh.visible = false;
    mesh.userData._entity = world.entity().add(Tags.Object3D, mesh);
    mesh.userData._entity.add(Tags.RainDropSplatter);
    const rain = mesh.userData._entity.get(Tags.RainDropSplatter);
  }

  function spawn(origin) {
    const mesh = pool.next();
    if (!mesh) return false;

    random.onCircle(random.range(0, 20), tmpArr2D);
    const x = origin.x + tmpArr2D[0] - velocity.x * 10;
    const z = origin.z + tmpArr2D[1] - velocity.z * 0;

    rainGroup.add(mesh);

    mesh.geometry = random.pick(geometries);
    mesh.position.set(x, random.range(7.5, 15), z);
    mesh.material.color.copy(random.pick(colors));
    mesh.visible = false;
    mesh.userData._entity = world.entity().add(Tags.Object3D, mesh);
    mesh.userData._entity.add(Tags.RainDrop);
    MathUtil.quaternionFromNormal(velocity, mesh.quaternion);
    const rain = mesh.userData._entity.get(Tags.RainDrop);
    rain.speed = random.range(10, 10);

    mesh.updateMatrix();
    mesh.updateMatrixWorld();
    tmpVec3.set(0, baseLength, 0);
    tmpVec3.applyMatrix4(mesh.matrixWorld);
    ray.origin.copy(tmpVec3);
    const hit = ray.intersectPlane(hitPlane, rayHitTarget);
    if (!hit) {
      // unlikely to get here unless we mess up spawn position?
      rain.splat = true;
    } else {
      rain.splatterSpawnPosition.copy(rayHitTarget);
    }

    return true;
  }
}
