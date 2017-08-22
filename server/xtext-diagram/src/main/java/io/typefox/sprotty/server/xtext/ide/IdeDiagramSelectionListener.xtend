/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */ 
package io.typefox.sprotty.server.xtext.ide

import com.google.inject.Inject
import io.typefox.sprotty.api.IDiagramSelectionListener
import io.typefox.sprotty.api.IDiagramServer
import io.typefox.sprotty.api.SModelIndex
import io.typefox.sprotty.api.SelectAction
import io.typefox.sprotty.server.xtext.DiagramLanguageServerExtension
import io.typefox.sprotty.server.xtext.LanguageAwareDiagramServer
import org.eclipse.emf.common.util.URI
import org.eclipse.lsp4j.Location
import org.eclipse.lsp4j.Range
import org.eclipse.xtext.ide.server.UriExtensions

class IdeDiagramSelectionListener implements IDiagramSelectionListener {
	
	@Inject extension DiagramLanguageServerExtension
	
	@Inject extension UriExtensions
	
	override selectionChanged(SelectAction action, IDiagramServer server) {
		if(server instanceof LanguageAwareDiagramServer) {
			val languageServerExtension = server.languageServerExtension
			if(languageServerExtension instanceof IdeLanguageServerExtension) {
				if(!action.deselectAll && action.selectedElementsIDs !== null && action.selectedElementsIDs.size === 1)  {
					val id = action.selectedElementsIDs.head
					val selectedElement = new SModelIndex(server.model).get(id)
					if (selectedElement instanceof io.typefox.sprotty.server.xtext.tracing.Traceable) {
						val traceRegion = selectedElement.significantRegion
						if(traceRegion !== null) {							
							val uri = server.sourceUri
							if(uri !== null) {
								uri.findDiagramServersByUri.forEach[
									languageServerExtension.languageServerAccess.doRead(
										URI.createURI(uri).toPath, [ context |
									 		val start = context.document.getPosition(traceRegion.offset)
									 		val end = context.document.getPosition(traceRegion.offset + traceRegion.length)
									 		languageServerExtension.client.openInTextEditor(new Location(uri, new Range(start, end)))
									 		return null
										])
								 	]
							}
						}
					}
				}
			}
		}
	}
}
					