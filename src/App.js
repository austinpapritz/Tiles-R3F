import * as THREE from 'three'
import { useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Image, ScrollControls, Scroll, useScroll, Html } from '@react-three/drei'
import { proxy, useSnapshot } from 'valtio'
import { Suspense } from 'react'

const damp = THREE.MathUtils.damp
const material = new THREE.LineBasicMaterial({ color: 'white' })
const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, -0.5, 0), new THREE.Vector3(0, 0.5, 0)])
const state = proxy({
	clicked: null,
	urls: [1, 2, 3].map((u) => `/${u}.jpg`)
})

// Item is one tile
function Item({ index, position, scale, c = new THREE.Color(), ...props }) {
	const ref = useRef()
	const data = useScroll()
	const { clicked, urls } = useSnapshot(state)
	const [hovered, hover] = useState(false)
	const click = () => (state.clicked = index === clicked ? null : index)
	const over = () => hover(true)
	const out = () => hover(false)
	const y = 5
	useFrame((state, delta) => {
		// Adjust the scale and grayscale of the item based on whether it is clicked, hovered, or in view.
		adjustItemAppearance(ref, y, clicked, index, hovered, delta, c, scale)

		// Adjust the position of items when an item is clicked.
		adjustItemPosition(ref, position, clicked, index, delta)
	})
	return <Image ref={ref} {...props} position={position} scale={scale} onClick={click} onPointerOver={over} onPointerOut={out} />
}

function adjustItemAppearance(ref, y, clicked, index, hovered, delta, color, scale) {
	// Determine if the current item is the one that has been clicked
	const isClicked = clicked === index

	// Adjust the vertical scale of the item based on whether it's clicked or its position in the view
	const targetYScale = isClicked ? 5 : 4
	ref.current.material.scale[1] = ref.current.scale.y = damp(ref.current.scale.y, targetYScale, 8, delta)

	// Adjust the horizontal scale of the item based on whether it's clicked
	const targetXScale = isClicked ? 4.7 : scale[0]
	ref.current.material.scale[0] = ref.current.scale.x = damp(ref.current.scale.x, targetXScale, 6, delta)

	// Adjust the grayscale of the item based on whether it's hovered, clicked, or its position in the view
	const targetGrayscale = hovered || isClicked ? 0 : Math.max(0, 1 - y)
	ref.current.material.grayscale = damp(ref.current.material.grayscale, targetGrayscale, 6, delta)

	// Adjust the color of the item based on whether it's hovered or clicked
	const targetColor = hovered || isClicked ? 'white' : '#aaa'
	ref.current.material.color.lerp(color.set(targetColor), hovered ? 0.3 : 0.1)
}

function adjustItemPosition(ref, position, clicked, index, delta) {
	if (clicked !== null && index < clicked) ref.current.position.x = damp(ref.current.position.x, position[0] - 2, 6, delta)
	if (clicked !== null && index > clicked) ref.current.position.x = damp(ref.current.position.x, position[0] + 2, 6, delta)
	if (clicked === null || clicked === index) ref.current.position.x = damp(ref.current.position.x, position[0], 6, delta)
}

function Items({ w = 0.7, gap = 0.15 }) {
	const { urls } = useSnapshot(state)
	const { width } = useThree((state) => state.viewport)
	const xW = w + gap
	return (
		// how does pages
		<ScrollControls horizontal damping={0.1} pages={(width - xW + urls.length * xW) / width}>
			<Scroll>
				{
					urls.map((url, i) => <Item key={i} index={i} position={[i * xW, 0, 0]} scale={[w, 4, 1]} url={url} />) /* prettier-ignore */
				}
			</Scroll>
		</ScrollControls>
	)
}

export const App = () => (
	<>
		<Canvas gl={{ antialias: false }} dpr={[1, 1.5]} onPointerMissed={() => (state.clicked = null)}>
			<Suspense fallback={<Html center className="loading" children="Loading..." />}>
				<Items />
			</Suspense>
		</Canvas>
	</>
)
