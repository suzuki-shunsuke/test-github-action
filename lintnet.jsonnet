function(param) {
  targets: [
    {
      data_files: [
        '.github/workflows/*.yml',
        '.github/workflows/*.yaml',
      ],
      modules: [
        'github_archive/github.com/lintnet/modules/modules/ghalint/action_ref_should_be_full_length_commit_sha/main.jsonnet@d69d0083dcb2696dd3427c484f36940f717a9285:v0.1.2',
      ],
    },
  ],
}
