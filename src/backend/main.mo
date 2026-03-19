import Array "mo:core/Array";
import Text "mo:core/Text";
import Order "mo:core/Order";
import List "mo:core/List";
import Runtime "mo:core/Runtime";

actor {
  type Score = {
    playerName : Text;
    score : Nat;
  };

  module Score {
    public func compare(score1 : Score, score2 : Score) : Order.Order {
      Nat.compare(score2.score, score1.score);
    };
  };

  let scoresList = List.empty<Score>();

  public shared ({ caller }) func submitScore(playerName : Text, score : Nat) : async () {
    if (playerName.isEmpty()) { Runtime.trap("Player name cannot be empty.") };
    scoresList.add({ playerName; score });
  };

  public query ({ caller }) func getLeaderboard() : async [Score] {
    let sortedScores = scoresList.toArray().sort();
    let topScores = List.empty<Score>();
    for (i in Nat.range(0, 10)) {
      if (i < sortedScores.size()) {
        topScores.add(sortedScores[i]);
      };
    };
    topScores.toArray();
  };
};
