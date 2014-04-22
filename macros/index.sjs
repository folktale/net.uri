macro $_net_uri_to {
  rule { ( $a ) } => {
    .to($a)
  }
  rule { ( $a $b ...) } => {
    .to($a) $_net_uri_to($b ...)
  }
}

macro $uri {
  rule { ($URI => $a $(~ $b) ... ? $c ) } => {
    $URI.fromString($a) $_net_uri_to($b ...) .set($c)
  }
  rule { ($URI => $a $(~ $b) ... ) } => {
    $URI.fromString($a) $_net_uri_to($b ...)
  }
}

export $uri
