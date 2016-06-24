/**
 * Copyright © 2012, 2013 dr. ir. Jeroen M. Valk
 * 
 * This file is part of Badgerfish CPX. Badgerfish CPX is free software:
 * you can redistribute it and/or modify it under the terms of the GNU Lesser
 * General Public License as published by the Free Software Foundation, either
 * version 3 of the License, or (at your option) any later version. Badgerfish
 * CPX is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
 * PURPOSE. See the GNU Lesser General Public License for more details. You
 * should have received a copy of the GNU Lesser General Public License along
 * with Badgerfish CPX. If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * @constructor nl.agentsatwork.server.Catalog
 * 
 * @param protocol
 *            {String} protocol; typically 'http:'
 * @param authority
 *            {String} authority; typically the hostname
 * @param catalog
 *            {Badgerfish} Badgerfish representation of the catalog
 * 
 */

function Catalog$normalize(uri, base) {
	return uri;
}

function Catalog$resolveURI(url, uri) {
	for ( var i = 0; i < uri.length; ++i) {
		if (url === normalize(uri[i]["@name"])) {
			return normalize(uri[i]["@uri"], uri[i]["@xml:base"]);
		}
	}
}

function Catalog$resolveRewriteURI(url, rewriteURI) {
	for ( var i = 0; i < rewriteURI.length; ++i) {
		var prefix = normalize(rewriteURI[i]["@uriStartString"]);
		if (url.substr(0, prefix.length) === prefix) {
			return normalize(rewriteURI[i]["@rewritePrefix"])
					+ url.substr(prefix.length);
		}
	}
}

function Catalog$resolve(protocol, authority, catalog) {
	for ( var i = 0; i < authority.length; ++i) {
		var url = request.url;
		console.assert(url.charAt(0) === '/');
		var auth = authority[i].$;
		if (auth.charAt(0) !== '/') {
			auth = "//" + auth;
		}
		url = normalize(protocol + auth + url);

		var result = resolveURI(url, catalog.uri);

		if (!result) {
			result = resolveRewriteURI(url, catalog.rewriteURI);
		}
	}
}
