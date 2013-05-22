
enyo.kind({
	name : 'enyo.sample.BasicLayoutSample',
    components: [
        {
        	classes: 'basic-layout-sample enyo-fit',
        	kind: "enyo.HLayout",
        	components: [
        		{kind: "Image", src: "assets/default-movie.png", style: "width: 200px;"},
        		{kind: "enyo.VLayout", components: [
        			{name: 'row1', content: "row1", style: "width: 100px;"},
        			{name: 'row2', content: "row2", style: "width: 100px;"},
        			{name: 'row3', content: "row3", style: "width: 100px;"},
        			{components: [
        				{kind: "enyo.HBox", content: "H1"},
        				{kind: "enyo.HBox", content: "H2"},
        				{kind: "enyo.HBox", content: "H3"},
        			]},
        		]},
        		{
                    kind: "enyo.VLayout",
                    name: "artistInfo",
                    components: [
                        {kind: "enyo.HLayout", components: [
                            {content: "Organized"},
                            {content: "organizedDate"}
                        ]},
                        {kind: "enyo.HLayout", components: [
                            {content: "Debut"},
                            {content: "debutDate"}
                        ]},
                        {kind: "enyo.HLayout", components: [
                            {content: "Type"},
                            {content: "type"}
                        ]}
                    ]
                },
                {
                    classes: "enyo-table",
                    components: [
                        {
                            classes: "enyo-table-row",
                            components: [
                                {classes: "enyo-table-cell", content: "Organized"},
                                {classes: "enyo-table-cell", content: "organizedDate"}
                            ]
                        },
                        {
                            classes: "enyo-table-row",
                            components: [
                                {classes: "enyo-table-cell", content: "Debut"},
                                {classes: "enyo-table-cell", content: "debutDate"}
                            ]
                        },
                        {
                            classes: "enyo-table-row",
                            components: [
                                {classes: "enyo-table-cell", content: "Type"},
                                {classes: "enyo-table-cell", content: "type"}
                            ]
                        }
                    ]
                },
                {
                    kind: "enyo.Table",
                    components: [
                        {
                            components: [
                                {content: "Organized"},
                                {content: "organizedDate"}
                            ]
                        },
                        {
                            components: [
                                {content: "Debut"},
                                {content: "debutDate"}
                            ]
                        },
                        {
                            components: [
                                {content: "Type"},
                                {content: "type"}
                            ]
                        }
                    ]
                }
        	]
        }
    ]
});