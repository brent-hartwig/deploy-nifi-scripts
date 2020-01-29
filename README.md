## Deploy NiFi Scripts to Remote Server

This is a sample project illustrating how one may deploy scripts to a remote NiFi server.  The scripts are stored outside the NiFi template (not included).  Relevant NiFi processors are to utilize their `scriptFile` property rather than their `scriptBody` property.  Advantages of doing so include being able to review code easier, reuse code, and allow multiple developers to work simultaneously a little better than they otherwise would have been able to.  This may also be used to cover the NiFi script portion of CI/CD.[^ssh][^templates]

The deployment task name is `deployNiFiScripts`, and is defined within `nifi/build.gradle`.  It may be invoked directly, by running Gradle within the `nifi` sub-directory.  It may also be incorporated within `marklogic-data-hub/build.gradle`, such as `mlLoadModules.dependsOn ':nifi:deployNiFiScripts'`.  The barebones MarkLogic Data Hub project is configured to include the `nifi` sub-directory.  Using Gradle's [Multi-Project Build](https://docs.gradle.org/current/userguide/multi_project_builds.html) terminology, the MarkLogic Data Hub project is the "root" project and the NiFi project is its sub-project.

`deployNiFiScripts` copies the contents of a local directory (including its sub-directories) to a remote directory, sets file ownership and permissions, appends a timestamp and username to `[nifiTargetScriptsDir]/deployment.log`, and preserves a configurable number of backups.

At this time, this project's implementation is only compatible with UNIX® like operating systems.

Time to configure your `nifi/gradle.properties`...

```
# NiFi host to deploy to.
nifiHost=

# The username to connect to the NiFi server with.
nifiServerUsername=

# The identify file to use when connecting to the NiFi server.
nifiServerIdentifyFile=

# Directory of scripts to recursively copy.  If in a multi-project context, path needs to be relative to root
# project's directory.
nifiSourceScriptsDir=../nifi/src/scripts

# Directory to write the scripts within, on the NiFi server.  Trailing slash is optional.
nifiTargetScriptsDir=/scripts/demo

# Owner of NiFi scripts once deployed on the NiFi server (typically the NiFi process owner).
nifiScriptUser=

# User group of the NiFi scripts once deployed on the NiFi server.
nifiScriptGroup=

# File permissions to set on the deployed NiFi scripts.
nifiScriptPerms=u=rwx,g=rwx,o=rx

# Copying the scripts involves a mv command, which fails if a sub-directory it's asked to move already exists.
# We're getting around this by including `--backup=numbered`.  To avoid bloat, set `nifiScriptBackupLimit` to
# a number in the range of 0 through 9.
nifiScriptBackupLimit=3
```

[^ssh]: While this project uses the [Gradle SSH Plugin](https://gradle-ssh-plugin.github.io/) to meet a common NiFi deployment need, the plugin may be used for additional deployment needs requiring one to copy files and execute commands on remote servers.

[^templates]: For the NiFi template portion of automated deployments, please see rjrudin's [nifi-gradle](https://github.com/rjrudin/nifi-gradle/) project.  There's definitely an argument for adding this project's `deployNiFiScripts` Gradle task into the other project!
