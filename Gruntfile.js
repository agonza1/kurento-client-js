/*
 * (C) Copyright 2014 Kurento (http://kurento.org/)
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the GNU Lesser General Public License
 * (LGPL) version 2.1 which accompanies this distribution, and is available at
 * http://www.gnu.org/licenses/lgpl-2.1.html
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 */


module.exports = function(grunt)
{
  var DIST_DIR = 'dist';

  var pkg = grunt.file.readJSON('package.json');

  const PKG_BROWSER = 'lib/browser.js';

  var bower =
  {
    TOKEN:      process.env.TOKEN,
    repository: 'git://github.com/Kurento/<%= pkg.name %>-bower.git'
  };

  // Project configuration.
  grunt.initConfig(
  {
    pkg:   pkg,
    bower: bower,

    // Plugins configuration
    clean:
    {
      generated_code: DIST_DIR,

      generated_doc: '<%= jsdoc.all.dest %>'
    },

    // Generate documentation
    jsdoc:
    {
      all:
      {
        src:
        [
          'README.md',
          'lib/**/*.js',
          'node_modules/kurento-client-core/lib/**/*.js',
          'node_modules/kurento-client-elements/lib/**/*.js',
          'node_modules/kurento-client-filters/lib/**/*.js',
          'test/*.js'
        ],
        dest: 'doc/jsdoc'
      }
    },

    // Generate browser versions and mapping debug file
    browserify:
    {
      options:
      {
        alias : ['<%= pkg.main %>:<%= pkg.name %>']
      },

      'standard':
      {
        src:  PKG_BROWSER,
        dest: DIST_DIR+'/<%= pkg.name %>.js'
      },

      'minified':
      {
        src:  PKG_BROWSER,
        dest: DIST_DIR+'/<%= pkg.name %>.min.js',

        options:
        {
          browserifyOptions:
          {
            debug: true
          },
          plugin:
          [
            ['minifyify',
              {
                compressPath: DIST_DIR,
                map: '<%= pkg.name %>.map',
                output: DIST_DIR+'/<%= pkg.name %>.map'
              }
            ]
          ]
        }
      }
    },

    // Generate bower.json file from package.json data
    sync:
    {
      bower:
      {
        options:
        {
          sync:
          [
            'name', 'description', 'license', 'keywords', 'homepage',
            'repository'
          ],
          overrides:
          {
            authors: (pkg.author ? [pkg.author] : []).concat(pkg.contributors || []),
            main: 'js/<%= pkg.name %>.js'
          }
        }
      }
    },

    // Publish / update package info in Bower
    shell:
    {
      bower:
      {
        command:
        [
          'curl -X DELETE "https://bower.herokuapp.com/packages/<%= pkg.name %>?auth_token=<%= bower.TOKEN %>"',
          'node_modules/.bin/bower register <%= pkg.name %> <%= bower.repository %>',
          'node_modules/.bin/bower cache clean'
        ].join('&&')
      }
    },

    // githooks configuration
    githooks:
    {
      options: {
        // Task-specific options go here.
      },
      all: {
        'pre-commit': 'clean'
        // Hook definitions go there
      }
    }
  });

  // Load plugins
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-npm2bower-sync');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-githooks');

  // Alias tasks
  grunt.registerTask('default', ['clean', 'jsdoc', 'browserify']);
  grunt.registerTask('bower',   ['sync:bower', 'shell:bower']);
};
