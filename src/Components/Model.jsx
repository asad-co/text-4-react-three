import { useGLTF } from '@react-three/drei'
import React, { useEffect, useRef, useState } from 'react'

const Model = ({faceCoordinates, ...props }) => {
  const group = useRef()
  const { nodes, materials } = useGLTF('/Assets/object3d/shoe/shoe.gltf')

  const [modelPosition, setModelPosition] = useState([0, 0, 0]);
  // Update the model's position when faceCoordinates change
  useEffect(() => {
    if (faceCoordinates) {
      // Calculate the new position based on faceCoordinates
      const newPosition = [faceCoordinates.x, faceCoordinates.y, faceCoordinates.z];
      setModelPosition(newPosition);
    }
  }, [faceCoordinates]);
  return (
    <group ref={group} position={modelPosition} {...props} dispose={null} scale={3}>
      <mesh geometry={nodes.shoe.geometry} material={materials.laces} material-color={props.customColors.setStripes} />
      <mesh geometry={nodes.shoe_1.geometry} material={materials.mesh} material-color={props.customColors.mesh} />
      <mesh geometry={nodes.shoe_2.geometry} material={materials.caps} material-color={props.customColors.soul} />
      <mesh geometry={nodes.shoe_3.geometry} material={materials.inner} material-color={props.customColors.soul} />
      <mesh geometry={nodes.shoe_4.geometry} material={materials.sole} material-color={props.customColors.soul} />
      <mesh geometry={nodes.shoe_5.geometry} material={materials.stripes} material-color={props.customColors.stripes} />
      <mesh geometry={nodes.shoe_6.geometry} material={materials.band} material-color={props.customColors.stripes} />
      <mesh geometry={nodes.shoe_7.geometry} material={materials.patch} material-color={props.customColors.soul} />
    </group>
  )
}

export default Model
