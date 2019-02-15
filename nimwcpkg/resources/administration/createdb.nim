import
  os, parsecfg, strutils, logging,
  ../administration/create_standarddata,
  ../utils/logging_nimwc

when defined(sqlite): import db_sqlite
else:                 import db_postgres


setCurrentDir(getAppDir().replace("/nimwcpkg", "") & "/")

const
  sql_now =
    when defined(sqlite): "(strftime('%s', 'now'))"     # SQLite 3 epoch.
    else:                 "(extract(epoch from now()))" # Postgres epoch.

  sql_timestamp =
    when defined(sqlite): "timestamp" # SQLite 3 Timestamp.
    else:                 "integer"   # is internally Hardcoded to UTC anyways

  sql_id = # http://blog.2ndquadrant.com/postgresql-10-identity-columns
    when defined(sqlite): "integer"     # SQLite 3 integer ID.
    else:                 "integer generated by default as identity"

  sql_nooids = # http://revsys.com/tidbits/why-you-should-make-your-postgresql-tables-without-oids
    when defined(sqlite): ""
    else:                 " WITHOUT OIDS"

  personTable = sql("""
    create table if not exists person(
      id         $3            primary key,
      name       varchar(60)   not null,
      password   varchar(300)  not null,
      twofa      varchar(8)    not null,
      email      varchar(254)  not null,
      creation   $2            not null           default $1,
      modified   $2            not null           default $1,
      salt       varchar(128)  not null,
      status     varchar(30)   not null,
      timezone   varchar(100),
      secretUrl  varchar(250),
      lastOnline $2            not null           default $1
    )$4;""".format(sql_now, sql_timestamp, sql_id, sql_nooids))

  sessionTable = sql("""
    create table if not exists session(
      id           $3                primary key,
      ip           inet              not null,
      key          varchar(300)      not null,
      userid       integer           not null,
      lastModified $2                not null     default $1,
      foreign key (userid) references person(id)
    )$4;""".format(sql_now, sql_timestamp, sql_id, sql_nooids))

  historyTable = sql("""
    create table if not exists history(
      id              $3             primary key,
      user_id         integer        not null,
      item_id         integer,
      element         varchar(100),
      choice          varchar(100),
      text            varchar(1000),
      creation        $2             not null     default $1
    )$4;""".format(sql_now, sql_timestamp, sql_id, sql_nooids))

  settingsTable = sql("""
    create table if not exists settings(
      id              $1             primary key,
      analytics       text,
      head            text,
      footer          text,
      navbar          text,
      title           text,
      disabled        integer,
      blogorder       text,
      blogsort        text
    )$2;""".format(sql_id, sql_nooids))

  pagesTable = sql("""
    create table if not exists pages(
      id              $3             primary key,
      author_id       INTEGER        NOT NULL,
      status          INTEGER        NOT NULL,
      name            VARCHAR(200)   NOT NULL,
      url             VARCHAR(200)   NOT NULL     UNIQUE,
      title           TEXT,
      metadescription TEXT,
      metakeywords    TEXT,
      description     TEXT,
      head            TEXT,
      navbar          TEXT,
      footer          TEXT,
      standardhead    INTEGER,
      standardnavbar  INTEGER,
      standardfooter  INTEGER,
      tags            VARCHAR(1000),
      category        VARCHAR(1000),
      date_start      VARCHAR(100),
      date_end        VARCHAR(100),
      views           INTEGER,
      public          INTEGER,
      changes         INTEGER,
      modified        $2             not null     default $1,
      creation        $2             not null     default $1,
      foreign key (author_id) references person(id)
    )$4;""".format(sql_now, sql_timestamp, sql_id, sql_nooids))

  blogTable = sql("""
    create table if not exists blog(
      id              $3             primary key,
      author_id       INTEGER        NOT NULL,
      status          INTEGER        NOT NULL,
      name            VARCHAR(200)   NOT NULL,
      url             VARCHAR(200)   NOT NULL     UNIQUE,
      title           TEXT,
      metadescription TEXT,
      metakeywords    TEXT,
      description     TEXT,
      head            TEXT,
      navbar          TEXT,
      footer          TEXT,
      standardhead    INTEGER,
      standardnavbar  INTEGER,
      standardfooter  INTEGER,
      tags            VARCHAR(1000),
      category        VARCHAR(1000),
      date_start      VARCHAR(100),
      date_end        VARCHAR(100),
      views           INTEGER,
      public          INTEGER,
      changes         INTEGER,
      modified        $2             not null     default $1,
      creation        $2             not null     default $1,
      foreign key (author_id) references person(id)
    )$4;""".format(sql_now, sql_timestamp, sql_id, sql_nooids))

  filesTable = sql("""
    create table if not exists files(
      id            $3                primary key,
      url           VARCHAR(1000)     NOT NULL     UNIQUE,
      downloadCount integer           NOT NULL     default 1,
      lastModified  $2                NOT NULL     default $1
    )$4;""".format(sql_now, sql_timestamp, sql_id, sql_nooids))


proc generateDB*() =
  info("Database: Generating database")
  let
    dict = loadConfig("config/config.cfg")
    db_user = dict.getSectionValue("Database", "user")
    db_pass = dict.getSectionValue("Database", "pass")
    db_name = dict.getSectionValue("Database", "name")
    db_host = dict.getSectionValue("Database", "host")
    db_folder = dict.getSectionValue("Database", "folder")
    dbexists =
      when defined(sqlite): fileExists(db_host)
      else:                 db_host.len > 2

  if dbexists:
    info("Database: Database already exists. Inserting standard tables if they do not exist.")

  when defined(sqlite): discard existsOrCreateDir(db_folder)  # Creating folder

  info("Database: Opening database")  # Open DB
  var db =
    when defined(sqlite):
      db_sqlite.open(db_host, "", "", "")
    else:
      db_postgres.open(connection=db_host, user=db_user, password=db_pass, database=db_name)

  # User
  if not db.tryExec(personTable):
    info("Database: Person table already exists")

  # Session
  if not db.tryExec(sessionTable):
    info("Database: Session table already exists")

  # History
  if not db.tryExec(historyTable):
    info("Database: History table already exists")

  # Settings
  if not db.tryExec(settingsTable):
    info("Database: Settings table already exists")

  # Pages
  if not db.tryExec(pagesTable):
    info("Database: Pages table already exists")

  # Blog
  if not db.tryExec(blogTable):
    info("Database: Blog table already exists")

  # Files
  if not db.tryExec(filesTable):
    info("Database: Files table already exists")

  if not dbexists:
    info("Database: Inserting standard elements")
    createStandardData(db)

  info("Database: Closing database")
  close(db)
