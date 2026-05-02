"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function Plane3DMarker() {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(58, 58);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.pointerEvents = "none";
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 1.1, 6);
    camera.lookAt(0, 0, 0);

    const group = new THREE.Group();
    group.rotation.x = -0.35;
    group.rotation.z = -0.2;

    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.25, roughness: 0.35 });
    const wingMaterial = new THREE.MeshStandardMaterial({ color: 0x0f766e, metalness: 0.2, roughness: 0.45 });
    const glassMaterial = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.1, roughness: 0.2 });

    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 1.9, 6, 12), bodyMaterial);
    body.rotation.z = Math.PI / 2;
    group.add(body);

    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.5, 18), bodyMaterial);
    nose.rotation.z = -Math.PI / 2;
    nose.position.x = 1.2;
    group.add(nose);

    const wing = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.25, 0.08), wingMaterial);
    wing.position.x = -0.05;
    group.add(wing);

    const tailWing = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.9, 0.06), wingMaterial);
    tailWing.position.x = -1.05;
    group.add(tailWing);

    const cabin = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 10), glassMaterial);
    cabin.scale.set(1.15, 0.55, 0.35);
    cabin.position.set(0.55, 0, 0.22);
    group.add(cabin);

    scene.add(group);
    scene.add(new THREE.AmbientLight(0xffffff, 2.2));

    const key = new THREE.DirectionalLight(0xffffff, 3.2);
    key.position.set(2, 3, 4);
    scene.add(key);

    let frame = 0;
    function animate(timestamp: number) {
      group.rotation.y = Math.sin(timestamp / 650) * 0.24;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    }

    frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
      body.geometry.dispose();
      nose.geometry.dispose();
      wing.geometry.dispose();
      tailWing.geometry.dispose();
      cabin.geometry.dispose();
      bodyMaterial.dispose();
      wingMaterial.dispose();
      glassMaterial.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === host) {
        host.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={hostRef} className="size-[58px]" aria-hidden />;
}
