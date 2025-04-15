import Debug "mo:base/Debug";
import Principal "mo:base/Principal";
import Text "mo:base/Text";

actor {
  // Simple greeting function that returns a string
  public query func greet(name : Text) : async Text {
    return "Hello, " # name # "! Welcome to the Plebes project.";
  };
  
  // Version info
  public query func version() : async Text {
    return "Plebes v0.1.0";
  };
  
  // Simple counter to demonstrate state
  private stable var counter : Nat = 0;
  
  public func increment() : async Nat {
    counter += 1;
    return counter;
  };
  
  public query func getCount() : async Nat {
    return counter;
  };
  
  // Function to get canister ID
  public query func getCanisterId() : async Principal {
    return Principal.fromActor(self);
  };
  
  // Return health status
  public query func healthCheck() : async Bool {
    return true;
  };
} 