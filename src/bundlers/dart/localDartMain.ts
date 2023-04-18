export const template = `
/**
* This is an auto generated code. This code should not be modified since the file can be overwriten
* if new genezio commands are executed.
*/

import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';

import './lib/{{classFileName}}.dart';

void main(List<String> args) async {
  final port = int.tryParse(args.isNotEmpty ? args[0] : '') ?? 3000;
  var service;
  try {
    service = {{className}}();
  } catch(e, s) {
    print(e);
    print(s);
  }
  var response;

  final server = await HttpServer.bind(InternetAddress.anyIPv4, port);

  await for (HttpRequest req in server) {
    if (req.method == 'POST') {
      final eventString = await utf8.decoder.bind(req).join();
      final event = jsonDecode(eventString);

      if (event["genezioEventType"] == "cron") {
        final method = event["methodName"];
        switch (method) {
          {{#cronMethods}}
          case "{{name}}":
            {
              try {
                if (service == null) {
                  response = '{"jsonrpc": "2.0", "result": "{{className}} could not be instantiated. Check logs for more information.", "id": 0}';
                  break;
                }
  
                final result = await service.{{name}}();
                final json = jsonEncode(result);
                response = '{"jsonrpc": "2.0", "result": $json, "id": 0}';
              } catch(e, s) {
                print(e);
                print(s);
                response = '{"jsonrpc": "2.0", "result": "\${e.toString()}", "id": 0}';
              }
              break;
            }
          {{/cronMethods}}
          default:
            response = '{"jsonrpc": "2.0", "result": "No cron method found.", "id": 0}';
          break;
        };
      } else if (event["requestContext"]["http"]["path"].split("/").length > 2) {
        final method = event["requestContext"]["http"]["path"].split("/")[2];
        Codec<String, String> stringToBase64 = utf8.fuse(base64);
  
        var body = event["body"];
  
        try {
          body = jsonDecode(event["body"]);
        } catch (e) {}
  
        final Map<String, dynamic> req = Map.from({
          "headers": event["headers"],
          "http": event["requestContext"]["http"],
          "queryStringParameters": event["queryStringParameters"],
          "timeEpoch": event["requestContext"]["timeEpoch"],
          "body": (event["isBase64Encoded"] != null && event["isBase64Encoded"] == true)
              ? stringToBase64.decode(event["body"])
              : body,
        });
  
        var httpResponse;
        switch (method) {
          {{#httpMethods}}
          case "{{name}}":
            {
              if (service == null) {
                response = {"statusCode": 500, "body": "{{className}} could not be instantiated. Check logs for more information."};
                break;
              }
              
              try {
                httpResponse = await service.{{name}}(req);
              } catch(e, s) {
                print(e);
                print(s);
                httpResponse = {"statusCode": 500, "body": "\${e.toString()}"};
              }
              break;
            }
          {{/httpMethods}}
          default:
            response = {"statusCode": 404, "body": "No HTTP method found."};
          break;
        }
  
        try {
          final x = httpResponse is Map;
        if (httpResponse is Map && httpResponse["statusCode"] == null) {
          httpResponse["statusCode"] = 200;
        }
  
        if (httpResponse["body"] is Uint8List) {
          httpResponse["body"] = base64.encode(httpResponse["body"]);
          httpResponse["isBase64Encoded"] = true;
        } else if (httpResponse["body"] is Map) {
          try {
            httpResponse["body"] = jsonEncode(httpResponse["body"]);
          } catch (error) {}
        }
        } catch (e, s) {
          print(e);
          print(s);
          httpResponse = {"statusCode": 500, "body": "\${e.toString()}"};
        }
  
        response = jsonEncode(httpResponse);
      } else {
  
      Map<String, dynamic> map = jsonDecode(event["body"]);
  
      final method = (map["method"] as String).split(".")[1];
      final params = map["params"];
  
      switch(method) {
      {{#jsonRpcMethods}}
      case "{{name}}": {
        if (service == null) {
          response = '{"jsonrpc": "2.0", "result": "{{className}} could not be instantiated. Check logs for more information.", "id": 0}';
          break;
        }
  
        try {
        {{#parameters}}
          final param{{index}} = {{{cast}}};
        {{/parameters}}
        final result = await service.{{name}}({{#parameters}}param{{index}}{{^last}},{{/last}}{{/parameters}});
        final json = jsonEncode(result);
        response = '{"jsonrpc": "2.0", "result": $json, "id": 0}';
        } catch(e, s) {
          print(e);
          print(s);
          response = '{"jsonrpc": "2.0", "result": "\${e.toString()}", "id": 0}';
        }
        break;
      }
      {{/jsonRpcMethods}}
      default:
        response = '{"jsonrpc": "2.0", "result": "No JSONRPC method found.", "id": 0}';
      break;
    };
    }

      req.response
        ..headers.contentType = ContentType.json
        ..write(response);
    } else {
      req.response
        ..statusCode = HttpStatus.notFound
        ..write('404 Not Found');
    }
    await req.response.close();
  }

  print('End!');
}

`;