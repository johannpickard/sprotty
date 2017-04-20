import { TYPES, IActionDispatcher, LocalModelSource, SModelElementSchema } from "../../../src/base"
import { SEdgeSchema, SNode, SNodeSchema, SGraphSchema, SGraphFactory } from "../../../src/graph"
import { ElementMove, MoveAction } from "../../../src/features"
import createContainer from "./di.config"

export default function runStandalone() {
    const container = createContainer(false)

    // Initialize gmodel
    const node0 = { id: 'node0', type: 'node:circle', position: { x: 100, y: 100 }, size: { width: -1, height: -1 } }
    const node1 = { id: 'node1', type: 'node:circle', position: { x: 200, y: 150 }, size: { width: -1, height: -1 }, selected: true }
    const edge0 = { id: 'edge0', type: 'edge:straight', sourceId: 'node0', targetId: 'node1' }
    const graph: SGraphSchema = { id: 'graph', type: 'graph', children: [node0, node1, edge0] }

    let count = 2
    function addNode(): SModelElementSchema[] {
        const newNode: SNodeSchema = {
            id: 'node' + count,
            type: 'node:circle',
            position: {
                x: Math.random() * 1024,
                y: Math.random() * 768
            },
            size: {
                width: 40,
                height: 40
            }
        }
        const newEdge: SEdgeSchema = {
            id: 'edge' + count,
            type: 'edge:straight',
            sourceId: 'node0',
            targetId: 'node' + count++
        }
        graph.children.push(newNode)
        graph.children.push(newEdge)
        return [newNode, newEdge]
    }

    for (let i = 0; i < 200; ++i) {
        addNode()
    }

    // Run
    const modelSource = container.get<LocalModelSource>(TYPES.ModelSource)
    modelSource.setModel(graph)

    // Button features
    document.getElementById('addNode')!.addEventListener('click', () => {
        const newElements = addNode()
        modelSource.addElements(newElements)
        document.getElementById('graph')!.focus()
    })

    const dispatcher = container.get<IActionDispatcher>(TYPES.IActionDispatcher)
    const factory = container.get<SGraphFactory>(TYPES.IModelFactory)
    document.getElementById('scrambleNodes')!.addEventListener('click', function (e) {
        const nodeMoves: ElementMove[] = []
        graph.children.forEach(shape => {
            if (factory.isNodeSchema(shape)) {
                nodeMoves.push({
                    elementId: shape.id,
                    toPosition: {
                        x: Math.random() * 1024,
                        y: Math.random() * 768
                    }
                })
            }
        })
        dispatcher.dispatch(new MoveAction(nodeMoves, true))
        document.getElementById('graph')!.focus()
    })

}
