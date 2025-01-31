public class Rotate {
    public static void main(String[] args) {
        int num = 12345;
        int rotations = 2;
        int pow = (int) Math.pow(10, rotations);
        int left = num / pow;
        int right = num % pow;

        // Count the Digit
        // System.out.println(right + "" + left);
        int count = 0;
        while (num != 0) {
            count++;
            num = num / 10;
        }
        int pow2 = count - rotations;
        int num2 = right * (int) Math.pow(10, pow2) + left;
        System.out.println(num2);

    }
}
