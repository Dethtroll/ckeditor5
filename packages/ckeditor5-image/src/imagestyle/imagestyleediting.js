/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/imagestyle/imagestyleediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ImageStyleCommand from './imagestylecommand';
import ImageEditing from '../image/imageediting';
import { viewToModelStyleAttribute, modelToViewStyleAttribute } from './converters';
import { normalizeImageStyles } from './utils';

/**
 * The image style engine plugin. It sets the default configuration, creates converters and registers
 * {@link module:image/imagestyle/imagestylecommand~ImageStyleCommand ImageStyleCommand}.
 *
 * @extends {module:core/plugin~Plugin}
 */
export default class ImageStyleEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ImageEditing ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'ImageStyleEditing';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const schema = editor.model.schema;
		const data = editor.data;
		const editing = editor.editing;

		// Define default configuration.
		editor.config.define( 'image.styles', [ 'imageStyleFull', 'imageStyleSide' ] );

		// Get configuration.
		const styles = normalizeImageStyles( editor.config.get( 'image.styles' ) );

		// Allow imageStyle attribute in image.
		// We could call it 'style' but https://github.com/ckeditor/ckeditor5-engine/issues/559.
		schema.extend( 'image', { allowAttributes: 'imageStyle' } );

		// Converters for imageStyle attribute from model to view.
		const modelToViewConverter = modelToViewStyleAttribute( styles );
		editing.downcastDispatcher.on( 'attribute:imageStyle:image', modelToViewConverter );
		data.downcastDispatcher.on( 'attribute:imageStyle:image', modelToViewConverter );

		// Converter for figure element from view to model.
		data.upcastDispatcher.on( 'element:figure', viewToModelStyleAttribute( styles ), { priority: 'low' } );

		// Register separate command for each style.
		for ( const style of styles ) {
			editor.commands.add( style.name, new ImageStyleCommand( editor, style ) );
		}
	}
}

/**
 * Image style format descriptor.
 *
 *		import fullWidthIcon from 'path/to/icon.svg`;
 *
 *		const imageStyleFormat = {
 *			name: 'fullSizeImage',
 *			icon: fullWidthIcon,
 *			title: 'Full size image',
 *			className: 'image-full-size'
 *		}
 *
 * @typedef {Object} module:image/imagestyle/imagestyleediting~ImageStyleFormat
 * @property {String} name The unique name of the style. It will be used to:
 * * register the {@link module:core/command~Command command} which will apply this style,
 * * store the style's button in the editor {@link module:ui/componentfactory~ComponentFactory},
 * * store the style in the `imageStyle` model attribute.
 * @property {Boolean} [isDefault] When set, the style will be used as the default one.
 * A default style does not apply any CSS class to the view element.
 * @property {String} icon One of the following to be used when creating the style's button:
 *  * An SVG icon source (as an XML string),
 *  * One of {@link module:image/imagestyle/imagestyleediting~ImageStyleEditing.defaultIcons} to use a default icon provided by the plugin.
 * @property {String} title The style's title.
 * @property {String} className The CSS class used to represent the style in view.
 */
