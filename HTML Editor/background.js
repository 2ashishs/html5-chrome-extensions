
			window.URL = window.URL || window.webkitURL;

			// deflate

			var decode = function ( string ) {

				return RawDeflate.inflate( window.atob( string ) );

			};

			var encode = function ( string ) {

				return window.btoa( RawDeflate.deflate( string ) );

			};

			//

			var documents = [ {
				filename: 'Untitled',
				filetype: 'text/plain',
				autoupdate: true,
				code: decode( 'bVRtT9swEP5cfsWtfAlTcQJTNdYXpq2UMWloCJCmfXTja+KR2JnjtBTU/76zk1QtS1TV9t3je+7Vk3dXP2ePv+/mkNo8uzya1EtvkiIXtPYmOVoOccpNiXbar+zy9KLvFaXdZOh2vYUWG3h1u96Cx0+J0ZUSp7HOtBnB8dJ/Y6/OuUmkGkFUH/UKzTLT6xGkUghUXrp1xsPW+iRsPJk4lpo4NrKwUJp42k+tLUZhmBuh9YIl0qbVgsU6D21qENmfMlxUMhPNMZeKRP1LMu9t7Jm7PHLcYQhrbZ64jwCW2lDkRucIiyohJ2uyWAtkidZJhp6qCD1IVnkoy7LCMhSUM5l9lmL6YfjpIjqOz86ddbmEANZSCb1mUik0v6SwKUynU4jgBF67dFBwg8ruycYHsBuUSWrf4GrhGLY+y/S5dcUpGp6j4QMoY1Q4ALoh0KAZt/oEKVhrNgPIuUUjeUY7LNOxz45U0gYnHsyVdAh3csdlpWIrtYIa0jSD/6spyUGFa3i8uZ/P2R2askC6sMKZ1wbwcTjoiD7sCHUAZ/SLIsrYeI+AFbqUzgX2QlzDKKod6/lID9gfnKR1vNdGfAD5HuuSpyiMVt8afQDnUUTELWubn4N7t5Sqr7yU8W2jDaiozRxEz5H/XJwGl4a8HoE1Fe4Jfkiy5SIfwTlsofXRVeA/nqCjWK1zPmjGhQh89XaG2nofGJtxteLlfaNq6ruDMhr7B/mCHY076GrElkrouMpdQ7qxZbwoyN4spVEMdl3HhM7nGTpUe2172E27LqOGarz6S/Nlv3g5Ia5d1oIWd5AwZrT1GPZM4V6Rmim9JlPvIWJUh+G4A7rpgp69yR6rN0E7RU2H74ew98BMwvrhoofMPa3/AA==' )
			} ];

			if ( localStorage.codeeditor !== undefined ) {

				documents = JSON.parse( localStorage.codeeditor );

			}

			if ( window.location.hash ) {

				var hash = window.location.hash.substr( 1 );
				var version = hash.substr( 0, 2 );

				if ( version == 'A/' ) {

					alert( 'That shared link format is no longer supported.' );

				} else if ( version == 'B/' ) {

					documents[ 0 ].code = decode( hash.substr( 2 ) );

				}

			}

			// preview

			var preview = document.createElement( 'div' );
			preview.style.position = 'absolute';
			preview.style.left = '0px';
			preview.style.top = '0px';
			preview.style.width = window.innerWidth + 'px';
			preview.style.height = window.innerHeight + 'px';
			document.body.appendChild( preview );

			// editor

			var interval;

			var code = CodeMirror( document.body, {

				value: documents[ 0 ].code,
				mode: "text/html",
				lineNumbers: true,
				matchBrackets: true,
				indentWithTabs: true,
				tabSize: 4,
				indentUnit: 4,

				onChange: function () {

					buttonSave.style.display = '';
					buttonDownload.style.display = 'none';

					if ( documents[ 0 ].autoupdate === false ) return;

					clearTimeout( interval );
					interval = setTimeout( update, 300 );

				}

			} );

			var codeElement = code.getWrapperElement();
			codeElement.style.position = 'absolute';
			codeElement.style.width = window.innerWidth + 'px';
			codeElement.style.height = window.innerHeight + 'px';
			document.body.appendChild( codeElement );

			// toolbar

			var pad = function ( number, length ) {

				var string = number.toString();

				while ( string.length < length ) string = '0' + string;
				return string;

			}

			var toolbar = document.createElement( 'div' );
			toolbar.style.position = 'absolute';
			toolbar.style.right = '15px';
			toolbar.style.top = '15px';
			document.body.appendChild( toolbar );

			var buttonUpdate = document.createElement( 'button' );
			buttonUpdate.className = 'button';

			var checkbox = document.createElement( 'input' );
			checkbox.type = 'checkbox';

			if ( documents[ 0 ].autoupdate === true ) checkbox.checked = true;

			checkbox.style.margin = '-4px 4px -4px 0px';
			checkbox.addEventListener( 'click', function ( event ) {

				event.stopPropagation();

				documents[ 0 ].autoupdate = documents[ 0 ].autoupdate === false;

				localStorage.codeeditor = JSON.stringify( documents );

			}, false );
			buttonUpdate.appendChild( checkbox );
			buttonUpdate.appendChild( document.createTextNode( 'update' ) );

			buttonUpdate.addEventListener( 'click', function ( event ) {

				update();

			}, false );
			toolbar.appendChild( buttonUpdate );

			var buttonIO = document.createElement( 'span' );
			toolbar.appendChild( buttonIO );

			var buttonSave = document.createElement( 'button' );
			buttonSave.className = 'button';
			buttonSave.textContent = 'save';
			buttonSave.addEventListener( 'click', function ( event ) {

				save();

			}, false );
			buttonIO.appendChild( buttonSave );

			var buttonDownload = document.createElement( 'a' );
			buttonDownload.className = 'button';
			buttonDownload.style.display = 'none';
			buttonDownload.download = 'index.html';
			buttonDownload.textContent = 'download';
			buttonIO.appendChild( buttonDownload );

			var buttonShare = document.createElement( 'button' );
			buttonShare.className = 'button';
			buttonShare.textContent = 'share';
			buttonShare.addEventListener( 'click', function ( event ) {

				window.location.replace( '#B/' + encode( code.getValue() ) );

			}, false );
			buttonIO.appendChild( buttonShare );

			var buttonHide = document.createElement( 'button' );
			buttonHide.className = 'button';
			buttonHide.textContent = 'hide code';
			buttonHide.addEventListener( 'click', function ( event ) {

				toggle();

			}, false );
			toolbar.appendChild( buttonHide );

			var buttonInfo = document.createElement( 'button' );
			buttonInfo.className = 'button';
			buttonInfo.textContent = '?';
			buttonInfo.addEventListener( 'click', function ( event ) {

				window.open( 'https://github.com/mrdoob/code-editor' );

			}, false );
			toolbar.appendChild( buttonInfo );

			// events

			document.addEventListener( 'drop', function ( event ) {

				event.preventDefault();
				event.stopPropagation();

				var file = event.dataTransfer.files[ 0 ];

				documents[ 0 ].filename = file.name;
				documents[ 0 ].filetype = file.type;

				var reader = new FileReader();

				reader.onload = function ( event ) {

					code.setValue( event.target.result );

				};

				reader.readAsText( file );

			}, false );

			document.addEventListener( 'keydown', function ( event ) {

				if ( event.keyCode === 83 && ( event.ctrlKey === true || event.metaKey === true ) ) {

					event.preventDefault();
					save();

				}

				if ( event.keyCode === 13 && ( event.ctrlKey === true || event.metaKey === true ) ) {

					update();

				}

				if ( event.keyCode === 27 ) {

					toggle();

				}

			}, false );

			window.addEventListener( 'resize', function ( event ) {

				codeElement.style.width = window.innerWidth + 'px';
				codeElement.style.height = window.innerHeight + 'px';

				preview.style.width = window.innerWidth + 'px';
				preview.style.height = window.innerHeight + 'px';

			} );

			// actions

			var update = function () {

				while ( preview.children.length > 0 ) {

					preview.removeChild( preview.firstChild );

				}

				var iframe = document.createElement( 'iframe' );
				iframe.style.width = '100%';
				iframe.style.height = '100%';
				iframe.style.border = '0';
				preview.appendChild( iframe );

				var content = iframe.contentDocument || iframe.contentWindow.document;

				content.open();
				content.write( code.getValue() );
				content.close();

			};

			var save = function () {

				documents[ 0 ].code = code.getValue();

				localStorage.codeeditor = JSON.stringify( documents );

				var blob = new Blob( [ code.getValue() ], { type: documents[ 0 ].filetype } );
				var objectURL = URL.createObjectURL( blob );

				buttonDownload.href = objectURL;

				var date = new Date();
				buttonDownload.download = documents[ 0 ].filename;

				buttonSave.style.display = 'none';
				buttonDownload.style.display = '';

			};

			var toggle = function () {

				if ( codeElement.style.display === '' ) {

					buttonHide.textContent = 'show code';

					codeElement.style.display = 'none';
					buttonUpdate.style.display = 'none';
					buttonIO.style.display = 'none';
					buttonShare.display = 'none';

				} else {

					buttonHide.textContent = 'hide code';

					codeElement.style.display = '';
					buttonUpdate.style.display = '';
					buttonIO.style.display = '';
					buttonShare.display = '';

				}

			};

			update();
