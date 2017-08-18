require 'eventmachine'
require 'em-websocket'
require 'json'

class GameConnection < EventMachine::WebSocket::Connection
  def initialize(opts = {})
    super
    onopen { |handshake| on_open(handshake) }
    onmessage { |message| on_message(message) }
    onclose { on_close }
  end
    
  def on_open(handshake)
    Game.create_connection self
    puts "Connection opened"
  end
  
  def on_message(message)
    json = JSON.parse(message);
    Game.execute_path(json, json["data"]) if json["path"]
    puts message
  end
  
  def on_close
    Game.remove_connection self
    puts "Connection closed"
  end
    
end

module Game
	module_function

	CONNECTION = []
  COUPLE_PLAYERS = {user1: nil, user2: nil, user1_coor: nil, user2_coor: nil, score: 0.0 }	
  def create_connection(connection)
	  CONNECTION.push connection
    unless COUPLE_PLAYERS[:user1]
      COUPLE_PLAYERS[:user1] = connection
      send_message({"platform_id": 1}.to_json)
    else
      COUPLE_PLAYERS[:user2] = connection
      send_message({"platform_id": 2}.to_json)
    end
	end
	
	def send_message(message)
    CONNECTION.each do |conn|
      conn.send message
    end
	end
	
	def remove_connection(connection)
	  CONNECTION.delete connection
    if COUPLE_PLAYERS[:user1] == connection
      COUPLE_PLAYERS[:user1] = nil
      COUPLE_PLAYERS[:user1_coor] = nil
    else
      COUPLE_PLAYERS[:user2] = nil
      COUPLE_PLAYERS[:user2_coor] = nil
    end
	end

  def execute_path(method, data)
    value = send(method["path"], data)
    send_message({"#{method["path"]}": value, "data": data}.to_json)
  end
  
  def get_platform_id(args)
    unless COUPLE_PLAYERS[:user1]
      1
    else
      2
    end
  end

  def save_coordinates(args)
    id = args["user_id"]
    field = "user#{id}_coor".to_sym
    COUPLE_PLAYERS[field] = args["coor"]
  end
	
end

EventMachine.run do
  EventMachine.start_server "0.0.0.0", 8080, GameConnection
end
